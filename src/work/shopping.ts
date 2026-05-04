import type { Task } from '../types';
import type { WorkResult } from './types';

// Browser-like headers to bypass basic bot detection.
// 403/captcha are still possible on heavily guarded sites — classified as infrastructure.
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

function buildSignal(ttlMs: number): AbortSignal {
  return AbortSignal.timeout(Math.min(Math.max(ttlMs - 500, 2_000), 10_000));
}

// ─── Price extraction utilities ──────────────────────────────────────────────

// Universal: extract first valid Product price from JSON-LD <script> blocks.
function extractJsonLdPrice(html: string): { price: number; currency: string } | null {
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(pattern)) {
    try {
      const raw   = JSON.parse(m[1]!) as Record<string, unknown>;
      const nodes = (raw['@graph'] as unknown[] | undefined) ?? [raw];
      for (const node of nodes) {
        const n = node as Record<string, unknown>;
        if (n['@type'] !== 'Product') continue;
        const offers   = n['offers'] as Record<string, unknown> | null | undefined;
        if (!offers) continue;
        const price    = Number(offers['price'] ?? offers['lowPrice'] ?? 0);
        const currency = String(offers['priceCurrency'] ?? 'INR');
        if (price > 0) return { price, currency };
      }
    } catch { /* malformed JSON-LD — try next block */ }
  }
  return null;
}

// Amazon: two fallbacks beyond JSON-LD.
// 1. The rendered price-whole span (works on product detail pages).
// 2. priceAmount in Amazon's embedded JS data bundle (works on some listing pages).
function extractAmazonPrice(html: string): { price: number; currency: string } | null {
  // Pattern 1: a-price-whole (rendered)
  const p1 = /<span class="a-price-whole">([\d,]+)/.exec(html);
  if (p1) {
    const price = parseInt(p1[1]!.replace(/,/g, ''), 10);
    if (price > 0) return { price, currency: 'INR' };
  }
  // Pattern 2: a-offscreen (accessible)
  const p2 = /<span class="a-offscreen">₹?([\d,]+)/.exec(html);
  if (p2) {
    const price = parseInt(p2[1]!.replace(/,/g, ''), 10);
    if (price > 0) return { price, currency: 'INR' };
  }
  // Pattern 3: Embedded data
  const p3 = /"priceAmount":"([\d.]+)"/.exec(html);
  if (p3) {
    const price = Math.round(parseFloat(p3[1]!));
    if (price > 0) return { price, currency: 'INR' };
  }
  return null;
}

// Flipkart: SSR pages embed price in JSON data within <script> tags.
// Try several known key names; class-based extraction is too brittle (names rotate per deploy).
function extractFlipkartPrice(html: string): { price: number; currency: string } | null {
  for (const pattern of [/"finalPrice":(\d+)/, /"sellingPrice":(\d+)/, /"effectivePrice":(\d+)/, /"selling_price":(\d+)/]) {
    const m = pattern.exec(html);
    if (m) {
      const price = parseInt(m[1]!, 10);
      if (price > 100) return { price, currency: 'INR' };
    }
  }
  // Last resort: any INR rupee symbol near a digit sequence
  const inrMatch = /₹\s*([\d,]+)/.exec(html);
  if (inrMatch) {
    const price = parseInt(inrMatch[1]!.replace(/,/g, ''), 10);
    if (price > 100) return { price, currency: 'INR' };
  }
  return null;
}

// Myntra: embeds product data in a window.__mydata__ / window.mystoreId style object.
// Also has JSON-LD on detail pages. Price key names seen in SSR pages:
function extractMyntraPrice(html: string): { price: number; currency: string } | null {
  for (const pattern of [/"discountedPrice":(\d+)/, /"price":(\d+)/, /"mrp":(\d+)/]) {
    const m = pattern.exec(html);
    if (m) {
      const price = parseInt(m[1]!, 10);
      if (price > 100) return { price, currency: 'INR' };
    }
  }
  return null;
}

// Safely descend into nested objects without throwing.
function dig(obj: unknown, ...keys: string[]): unknown {
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

// ─── Per-source search functions ─────────────────────────────────────────────

interface PriceHit { price: number; platform: string; link: string }

async function searchCroma(product: string, ttlMs: number): Promise<PriceHit | null> {
  const url = `https://www.croma.com/search-results?q=${encodeURIComponent(product)}&inStoreAvailability=false`;
  let res: Response;
  try {
    res = await fetch(url, { headers: BROWSER_HEADERS, signal: buildSignal(ttlMs) });
  } catch (err) { 
    return null; 
  }
  if (!res.ok) return null;

  const html  = await res.text().catch(() => '');
  // Croma updated their script tag ID or structure frequently. 
  // Look for any script containing search result products.
  const match = /<script[^>]*>([\s\S]*?"products":\[\{[\s\S]*?\}\][\s\S]*?)<\/script>/.exec(html);
  if (!match) return null;

  let dataStr = match[1]!;
  // If it looks like JSON within a script, try to extract the JSON part.
  if (dataStr.includes('__NEXT_DATA__')) {
    const jsonMatch = /\{"@context"[\s\S]*\}|\{"props"[\s\S]*\}/.exec(dataStr);
    if (jsonMatch) dataStr = jsonMatch[0]!;
  }

  // Two known path variants across Croma app versions
  const products = (
    dig(data, 'props', 'pageProps', 'initialState', 'search', 'searchResult', 'products') ??
    dig(data, 'props', 'pageProps', 'searchData', 'products')
  ) as Array<Record<string, unknown>> | undefined;

  if (!Array.isArray(products) || !products.length) return null;

  let cheapest: PriceHit | null = null;
  for (const p of products) {
    const price = Number(p['sellingPrice'] ?? p['mrp'] ?? p['price'] ?? 0);
    const slug  = String(p['slugUrl'] ?? p['slug'] ?? '');
    if (price > 0 && (!cheapest || price < cheapest.price)) {
      cheapest = { price, platform: 'croma', link: slug ? `https://www.croma.com/${slug}` : 'https://www.croma.com' };
    }
  }
  return cheapest;
}

async function searchAmazon(product: string, ttlMs: number): Promise<PriceHit | null> {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: BROWSER_HEADERS, signal: buildSignal(ttlMs) });
  } catch (err) {
    return null;
  }
  if (!res.ok) return null;

  const html = await res.text().catch(() => '');

  // JSON-LD is sometimes present on Amazon search pages
  const jsonLd = extractJsonLdPrice(html);
  if (jsonLd) {
    const asinMatch = /data-asin="([A-Z0-9]{10})"/.exec(html);
    const link = asinMatch ? `https://www.amazon.in/dp/${asinMatch[1]}` : url;
    return { price: jsonLd.price, platform: 'amazon', link };
  }

  // Extract first ASIN + its nearby price-whole span
  // The pattern walks up to 3KB of HTML between the asin attribute and the price span
  const asinPriceMatch = /data-asin="([A-Z0-9]{10})"[\s\S]{0,3000}?class="a-price-whole">([\d,]+)/.exec(html);
  if (asinPriceMatch) {
    const price = parseInt(asinPriceMatch[2]!.replace(/,/g, ''), 10);
    if (price > 0) {
      return { price, platform: 'amazon', link: `https://www.amazon.in/dp/${asinPriceMatch[1]}` };
    }
  }

  // Embedded JS data bundle fallback
  const dataMatch = /"priceAmount":"([\d.]+)"/.exec(html);
  if (dataMatch) {
    const price = Math.round(parseFloat(dataMatch[1]!));
    if (price > 0) {
      const asinMatch = /data-asin="([A-Z0-9]{10})"/.exec(html);
      const link = asinMatch ? `https://www.amazon.in/dp/${asinMatch[1]}` : url;
      return { price, platform: 'amazon', link };
    }
  }

  // Final fallback: any price-whole class anywhere
  const anyPriceMatch = /class="a-price-whole">([\d,]+)/.exec(html);
  if (anyPriceMatch) {
    const price = parseInt(anyPriceMatch[1]!.replace(/,/g, ''), 10);
    if (price > 0) return { price, platform: 'amazon', link: url };
  }

  return null;
}

async function searchFlipkart(product: string, ttlMs: number): Promise<PriceHit | null> {
  // Try mobile site as it sometimes has lighter bot protection
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(product)}`;
  let res: Response;
  try {
    res = await fetch(url, { 
      headers: { 
        ...BROWSER_HEADERS, 
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.google.com/',
        'Cookie': 'dummy=1; SN=2'
      }, 
      signal: buildSignal(ttlMs) 
    });
  } catch (err) {
    return null;
  }
  if (!res.ok) return null;

  const html = await res.text().catch(() => '');

  const jsonLd = extractJsonLdPrice(html);
  if (jsonLd) return { price: jsonLd.price, platform: 'flipkart', link: url };

  const extracted = extractFlipkartPrice(html);
  if (!extracted) return null;

  // Try to pair the price with a product URL from the embedded data
  const urlMatch = /"productUrl":"([^"]+)"/.exec(html) ?? /"url":"(\/[^"]+\/p\/[^"]+)"/.exec(html);
  const link     = urlMatch ? `https://www.flipkart.com${urlMatch[1]}` : url;
  return { price: extracted.price, platform: 'flipkart', link };
}

// Myntra: primarily fashion (clothing, shoes, accessories).
// Electronics searches will return null — that is expected and not an error.
async function searchMyntra(product: string, ttlMs: number): Promise<PriceHit | null> {
  const url = `https://www.myntra.com/search?rawQuery=${encodeURIComponent(product)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: BROWSER_HEADERS, signal: buildSignal(ttlMs) });
  } catch { return null; }
  if (!res.ok) return null;

  const html = await res.text().catch(() => '');

  const jsonLd = extractJsonLdPrice(html);
  if (jsonLd) return { price: jsonLd.price, platform: 'myntra', link: url };

  const extracted = extractMyntraPrice(html);
  if (!extracted) return null;

  const pidMatch = /"productId":(\d+)/.exec(html);
  const link     = pidMatch ? `https://www.myntra.com/${pidMatch[1]}` : url;
  return { price: extracted.price, platform: 'myntra', link };
}

// ─── Exported task handlers ───────────────────────────────────────────────────

export async function findBestPrice(task: Task): Promise<WorkResult> {
  const start   = Date.now();
  const product = task.payload['product'];

  if (typeof product !== 'string' || !product.trim()) {
    return { success: false, kind: 'prediction', reason: 'missing_or_invalid_product_in_payload' };
  }

  // Query all sources in parallel. Each returns null on failure — no source throw.
  const [croma, amazon, flipkart, myntra] = await Promise.all([
    searchCroma(product, task.ttl_ms),
    searchAmazon(product, task.ttl_ms),
    searchFlipkart(product, task.ttl_ms),
    searchMyntra(product, task.ttl_ms),
  ]);

  const hits = [croma, amazon, flipkart, myntra].filter((h): h is PriceHit => h !== null);

  if (!hits.length) {
    // Every source failed — likely bot blocking across all.
    return { success: false, kind: 'infrastructure', reason: 'no_price_retrieved_from_any_source' };
  }

  hits.sort((a, b) => a.price - b.price);
  const best = hits[0]!;

  // Verification: re-fetch from the winning source and confirm < 10% price deviation.
  let verifyPrice: number | null = null;
  if (best.platform === 'croma') {
    verifyPrice = (await searchCroma(product, task.ttl_ms))?.price ?? null;
  } else if (best.platform === 'amazon') {
    verifyPrice = (await searchAmazon(product, task.ttl_ms))?.price ?? null;
  } else if (best.platform === 'flipkart') {
    verifyPrice = (await searchFlipkart(product, task.ttl_ms))?.price ?? null;
  } else if (best.platform === 'myntra') {
    verifyPrice = (await searchMyntra(product, task.ttl_ms))?.price ?? null;
  }

  if (verifyPrice !== null) {
    const deviation = Math.abs(verifyPrice - best.price) / best.price;
    if (deviation > 0.10) {
      return {
        success: false,
        kind:    'prediction',
        reason:  `price_unstable: ${(deviation * 100).toFixed(1)}% deviation on ${best.platform} exceeds 10%`,
      };
    }
  }

  const sources = hits.map((h) => h.platform).join(',');
  return {
    success:     true,
    data: {
      lowest_price:    best.price,
      platform:        best.platform,
      link:            best.link,
      product,
      sources_checked: sources,
      competitors:     hits.map(h => ({ platform: h.platform, price: h.price, link: h.link }))
    },
    source:      best.platform,
    fetchedAtMs: Date.now(),
    durationMs:  Date.now() - start,
  };
}

export async function trackPriceDrop(task: Task): Promise<WorkResult> {
  const start       = Date.now();
  const productUrl  = task.payload['product_url'];
  const targetPrice = task.payload['target_price'];

  if (typeof productUrl !== 'string' || !productUrl.startsWith('http')) {
    return { success: false, kind: 'prediction', reason: 'missing_or_invalid_product_url' };
  }
  if (typeof targetPrice !== 'number' || targetPrice <= 0) {
    return { success: false, kind: 'prediction', reason: 'missing_or_invalid_target_price' };
  }

  let res: Response;
  try {
    res = await fetch(productUrl, { headers: BROWSER_HEADERS, signal: buildSignal(task.ttl_ms) });
  } catch {
    return { success: false, kind: 'infrastructure', reason: 'failed_to_reach_product_page' };
  }
  if (!res.ok) {
    const kind = (res.status === 429 || res.status >= 500) ? 'infrastructure' : 'prediction';
    return { success: false, kind, reason: `http_${res.status}_from_product_page` };
  }

  const html = await res.text().catch(() => '');

  // Universal extraction first; fall through to site-specific when JSON-LD is absent.
  let extracted = extractJsonLdPrice(html);
  if (!extracted) {
    const hostname = new URL(productUrl).hostname;
    if (hostname.includes('amazon.in')) {
      extracted = extractAmazonPrice(html);
    } else if (hostname.includes('flipkart.com')) {
      extracted = extractFlipkartPrice(html);
    } else if (hostname.includes('myntra.com')) {
      extracted = extractMyntraPrice(html);
    }
  }

  if (!extracted || extracted.price === 0) {
    return { success: false, kind: 'prediction', reason: 'no_structured_price_found_on_page' };
  }

  if (extracted.price > targetPrice) {
    return {
      success: false,
      kind:    'prediction',
      reason:  `price_above_target: current=${extracted.price} target=${targetPrice}`,
    };
  }

  return {
    success:     true,
    data:        { current_price: extracted.price, target_price: targetPrice, currency: extracted.currency, product_url: productUrl },
    source:      productUrl,
    fetchedAtMs: Date.now(),
    durationMs:  Date.now() - start,
  };
}

export async function analyzeSupplyChain(task: Task): Promise<WorkResult> {
  const start   = Date.now();
  const product = task.payload['product'];

  if (typeof product !== 'string' || !product.trim()) {
    return { success: false, kind: 'prediction', reason: 'missing_product_in_payload' };
  }

  // Fetch from all sources
  const [croma, amazon, flipkart, myntra] = await Promise.all([
    searchCroma(product, task.ttl_ms),
    searchAmazon(product, task.ttl_ms),
    searchFlipkart(product, task.ttl_ms),
    searchMyntra(product, task.ttl_ms),
  ]);

  const results = [
    { platform: 'croma',    hit: croma },
    { platform: 'amazon',   hit: amazon },
    { platform: 'flipkart', hit: flipkart },
    { platform: 'myntra',   hit: myntra },
  ];

  const stockHits = results.filter(r => r.hit !== null);
  const stockoutPlatforms = results.filter(r => r.hit === null).map(r => r.platform);
  
  // Calculate Scarcity Score (0 to 100)
  // 0 = Available everywhere, 100 = Total stockout
  const availabilityRate = stockHits.length / results.length;
  const scarcityScore    = Math.round((1 - availabilityRate) * 100);

  // Analyze price variance as a "Demand Heat" signal
  const prices = stockHits.map(h => h.hit!.price);
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const demandHeat = prices.length > 1 ? (Math.max(...prices) - Math.min(...prices)) / avgPrice : 0;

  return {
    success: true,
    data: {
      product,
      scarcity_score: scarcityScore, // 100 = Impossible to find
      demand_heat:    Number(demandHeat.toFixed(4)), // High variance = volatile demand
      in_stock_at:    stockHits.map(h => h.platform),
      out_of_stock:   stockoutPlatforms,
      average_market_price: Math.round(avgPrice),
    },
    source: 'supply_chain_aggregator',
    fetchedAtMs: Date.now(),
    durationMs: Date.now() - start,
  };
}

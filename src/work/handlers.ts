import type { Task } from '../types';
import type { WorkResult, WorkFailureKind } from './types';
import { findBestPrice, trackPriceDrop, analyzeSupplyChain } from './shopping';
import { findCheapestFlight, trackFlightPrice } from './travel';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Bound the HTTP timeout to fit within the task TTL.
// Never wait longer than 8s or shorter than 1s regardless of TTL.
function buildSignal(ttlMs: number): AbortSignal {
  return AbortSignal.timeout(Math.min(Math.max(ttlMs - 200, 1_000), 8_000));
}

function classifyNetworkError(err: unknown): WorkResult {
  const isTimeout = err instanceof DOMException && err.name === 'TimeoutError';
  const msg = (err as Error).message ?? String(err);
  return {
    success: false,
    kind:    'infrastructure',
    reason:  isTimeout ? 'request_timeout' : `network_error: ${msg}`,
  };
}

// 429 and 5xx are infrastructure problems (rate limit, server down).
// Other 4xx are prediction problems (bad params, wrong endpoint).
function classifyHttpStatus(status: number): WorkFailureKind {
  return status === 429 || status >= 500 ? 'infrastructure' : 'prediction';
}

async function coingeckoGet(path: string, ttlMs: number): Promise<Response> {
  return fetch(`${COINGECKO_BASE}${path}`, {
    signal:  buildSignal(ttlMs),
    headers: { Accept: 'application/json' },
  });
}

export async function fetchSolUsdcPrice(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/simple/price?ids=solana&vs_currencies=usd', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { solana?: { usd?: number } };
    const price = body?.solana?.usd;
    if (typeof price !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing solana.usd' };
    }
    console.log(`[handlers] Fetched SOL price: ${price} USD`);
    return {
      success:     true,
      data:        { price, symbol: 'SOL/USDC', vs_currency: 'usd' },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

export async function fetchEthUsdcPrice(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/simple/price?ids=ethereum&vs_currencies=usd', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { ethereum?: { usd?: number } };
    const price = body?.ethereum?.usd;
    if (typeof price !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing ethereum.usd' };
    }
    console.log(`[handlers] Fetched ETH price: ${price} USD`);
    return {
      success:     true,
      data:        { price, symbol: 'ETH/USDC', vs_currency: 'usd' },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

export async function fetchBtcUsdcPrice(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/simple/price?ids=bitcoin&vs_currencies=usd', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { bitcoin?: { usd?: number } };
    const price = body?.bitcoin?.usd;
    if (typeof price !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing bitcoin.usd' };
    }
    console.log(`[handlers] Fetched BTC price: ${price} USD`);
    return {
      success:     true,
      data:        { price, symbol: 'BTC/USDC', vs_currency: 'usd' },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

export async function fetchDogeUsdcPrice(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/simple/price?ids=dogecoin&vs_currencies=usd', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { dogecoin?: { usd?: number } };
    const price = body?.dogecoin?.usd;
    if (typeof price !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing dogecoin.usd' };
    }
    console.log(`[handlers] Fetched DOGE price: ${price} USD`);
    return {
      success:     true,
      data:        { price, symbol: 'DOGE/USDC', vs_currency: 'usd' },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

export async function fetchBonkUsdcPrice(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/simple/price?ids=bonk&vs_currencies=usd', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { bonk?: { usd?: number } };
    const price = body?.bonk?.usd;
    if (typeof price !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing bonk.usd' };
    }
    console.log(`[handlers] Fetched BONK price: ${price} USD`);
    return {
      success:     true,
      data:        { price, symbol: 'BONK/USDC', vs_currency: 'usd' },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

export async function fetchBtcDominance(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet('/global', task.ttl_ms);
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as { data?: { market_cap_percentage?: { btc?: number } } };
    const dominance = body?.data?.market_cap_percentage?.btc;
    if (typeof dominance !== 'number') {
      return { success: false, kind: 'prediction', reason: 'malformed_response: missing btc dominance' };
    }
    return {
      success:     true,
      data:        { btc_dominance_pct: dominance },
      source:      'coingecko',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

// CoinGecko free tier doesn't expose L2 order books.
// We use Binance ticker data via CoinGecko: spread, volume, best bid/ask proxy.
// This is a realistic "orderbook analysis" output within free API constraints.
export async function deepOrderbookAnalysis(task: Task): Promise<WorkResult> {
  const start = Date.now();
  try {
    const res = await coingeckoGet(
      '/coins/solana/tickers?exchange_ids=binance&depth=true',
      task.ttl_ms
    );
    if (!res.ok) {
      return { success: false, kind: classifyHttpStatus(res.status), reason: `coingecko_http_${res.status}` };
    }
    const body = await res.json() as {
      tickers?: Array<{
        base:                     string;
        target:                   string;
        last:                     number;
        bid_ask_spread_percentage: number;
        volume:                   number;
        cost_to_move_up_usd?:     number;
        cost_to_move_down_usd?:   number;
      }>;
    };

    const ticker = body?.tickers?.find((t) => t.target === 'USDT');
    if (!ticker) {
      return { success: false, kind: 'prediction', reason: 'no_sol_usdt_ticker_found_on_binance' };
    }

    return {
      success: true,
      data: {
        pair:                  `${ticker.base}/${ticker.target}`,
        last_price:            ticker.last,
        spread_pct:            ticker.bid_ask_spread_percentage,
        volume_24h:            ticker.volume,
        cost_to_move_up_usd:   ticker.cost_to_move_up_usd   ?? null,
        cost_to_move_down_usd: ticker.cost_to_move_down_usd ?? null,
      },
      source:      'coingecko_binance_tickers',
      fetchedAtMs: Date.now(),
      durationMs:  Date.now() - start,
    };
  } catch (err) {
    return classifyNetworkError(err);
  }
}

// Dispatch real work by task type.
export async function performWork(task: Task): Promise<WorkResult> {
  switch (task.type) {
    case 'fetch_sol_usdc_price':     return fetchSolUsdcPrice(task);
    case 'fetch_eth_usdc_price':     return fetchEthUsdcPrice(task);
    case 'fetch_btc_usdc_price':     return fetchBtcUsdcPrice(task);
    case 'fetch_doge_usdc_price':    return fetchDogeUsdcPrice(task);
    case 'fetch_bonk_usdc_price':    return fetchBonkUsdcPrice(task);
    case 'fetch_btc_dominance':      return fetchBtcDominance(task);
    case 'deep_orderbook_analysis':  return deepOrderbookAnalysis(task);
    case 'find_best_price':      return findBestPrice(task);
    case 'track_price_drop':     return trackPriceDrop(task);
    case 'analyze_supply_chain': return analyzeSupplyChain(task);
    case 'find_cheapest_flight': return findCheapestFlight(task);
    case 'track_flight_price':   return trackFlightPrice(task);
    default:
      return { success: false, kind: 'prediction', reason: `no_handler_for_type: ${task.type}` };
  }
}

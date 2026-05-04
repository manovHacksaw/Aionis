import type { Task } from '../types';
import type { WorkResult } from './types';
import { env } from '../config/env';

// Amadeus REST API (sandbox: test.api.amadeus.com, production: api.amadeus.com).
// Register free at developers.amadeus.com — sandbox requires no credit card.
// Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in env to activate travel tasks.
// If credentials are absent, all travel tasks return infrastructure failure → cost refunded.

// Skyscanner has no public API (partner-only). Google Flights requires a headless browser.
// Amadeus is the highest-quality freely available flight data API.

// In-process OAuth2 token cache. Expires with the process — no persistence needed.
let tokenCache: { token: string; expiresAtMs: number } | null = null;

async function getAmadeusToken(): Promise<string | null> {
  if (!env.amadeusClientId || !env.amadeusClientSecret) return null;

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 30_000) {
    return tokenCache.token;
  }

  try {
    const res = await fetch(`${env.amadeusBaseUrl}/v1/security/oauth2/token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     env.amadeusClientId,
        client_secret: env.amadeusClientSecret,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = await res.json() as { access_token?: string; expires_in?: number };
    if (!body.access_token) return null;
    tokenCache = {
      token:       body.access_token,
      expiresAtMs: now + (body.expires_in ?? 1_799) * 1_000,
    };
    return tokenCache.token;
  } catch {
    return null;
  }
}

function buildSignal(ttlMs: number): AbortSignal {
  // Amadeus is slower than most APIs — leave 500ms headroom, clamp 3s–15s.
  return AbortSignal.timeout(Math.min(Math.max(ttlMs - 500, 3_000), 15_000));
}

interface FlightDateEntry {
  date:  string; // YYYY-MM-DD
  price: number; // USD total (Amadeus always returns USD for /shopping/flight-dates)
}

// GET /v1/shopping/flight-dates returns cheapest price per departure date for an O&D pair.
// Throws on non-OK HTTP responses (caller maps to infrastructure vs prediction).
async function fetchFlightDates(
  from:  string,
  to:    string,
  token: string,
  ttlMs: number,
): Promise<FlightDateEntry[]> {
  const params = new URLSearchParams({ origin: from, destination: to });
  const res    = await fetch(`${env.amadeusBaseUrl}/v1/shopping/flight-dates?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal:  buildSignal(ttlMs),
  });
  if (!res.ok) throw new Error(`amadeus_http_${res.status}`);
  const body = await res.json() as {
    data?: Array<{ departureDate: string; price: { total: string } }>;
  };
  return (body.data ?? [])
    .map((d) => ({ date: d.departureDate, price: parseFloat(d.price.total) }))
    .filter((d) => d.price > 0);
}

// Narrow flight entries to a date range when provided in the payload.
// If no valid date_range: return all entries unchanged.
function filterByDateRange(entries: FlightDateEntry[], dateRange: unknown): FlightDateEntry[] {
  if (!Array.isArray(dateRange) || dateRange.length < 2) return entries;
  const [s, e] = dateRange as [unknown, unknown];
  if (typeof s !== 'string' || typeof e !== 'string') return entries;
  return entries.filter((d) => d.date >= s && d.date <= e);
}

// Map an Amadeus HTTP error string to infrastructure vs prediction.
// 429 and 5xx = infrastructure (rate limit / server down).
// Other 4xx (400, 404) = prediction (bad IATA code / no route).
function classifyAmadeusError(msg: string): 'infrastructure' | 'prediction' {
  if (msg.includes('amadeus_http_429') || msg.includes('amadeus_http_5')) return 'infrastructure';
  return 'prediction';
}

export async function findCheapestFlight(task: Task): Promise<WorkResult> {
  const start = Date.now();
  const from  = task.payload['from'];
  const to    = task.payload['to'];

  if (typeof from !== 'string' || from.length !== 3) {
    return { success: false, kind: 'prediction', reason: 'invalid_from_iata_code' };
  }
  if (typeof to !== 'string' || to.length !== 3) {
    return { success: false, kind: 'prediction', reason: 'invalid_to_iata_code' };
  }

  const token = await getAmadeusToken();
  if (!token) {
    return { success: false, kind: 'infrastructure', reason: 'amadeus_credentials_missing_or_auth_failed' };
  }

  let entries: FlightDateEntry[];
  try {
    entries = await fetchFlightDates(from, to, token, task.ttl_ms);
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    return { success: false, kind: classifyAmadeusError(msg), reason: msg };
  }

  const filtered = filterByDateRange(entries, task.payload['date_range']);
  if (!filtered.length) {
    return { success: false, kind: 'prediction', reason: 'no_flights_found_for_route_and_date_range' };
  }

  filtered.sort((a, b) => a.price - b.price);
  const cheapest = filtered[0]!;

  // Verification: re-fetch same route, confirm deviation < 10%.
  let verifyEntries: FlightDateEntry[] = [];
  try { verifyEntries = await fetchFlightDates(from, to, token, task.ttl_ms); } catch { /* skip verification */ }
  if (verifyEntries.length) {
    const vf      = filterByDateRange(verifyEntries, task.payload['date_range']);
    const vBest   = vf.sort((a, b) => a.price - b.price)[0];
    if (vBest) {
      const deviation = Math.abs(vBest.price - cheapest.price) / cheapest.price;
      if (deviation > 0.10) {
        return {
          success: false,
          kind:    'prediction',
          reason:  `price_unstable: ${(deviation * 100).toFixed(1)}% deviation exceeds 10%`,
        };
      }
    }
  }

  return {
    success:     true,
    data:        { price: cheapest.price, date: cheapest.date, from, to, currency: 'USD', booking_link: 'https://www.amadeus.com' },
    source:      'amadeus',
    fetchedAtMs: Date.now(),
    durationMs:  Date.now() - start,
  };
}

export async function trackFlightPrice(task: Task): Promise<WorkResult> {
  const start       = Date.now();
  const from        = task.payload['from'];
  const to          = task.payload['to'];
  const targetPrice = task.payload['target_price'];

  if (typeof from !== 'string' || from.length !== 3) {
    return { success: false, kind: 'prediction', reason: 'invalid_from_iata_code' };
  }
  if (typeof to !== 'string' || to.length !== 3) {
    return { success: false, kind: 'prediction', reason: 'invalid_to_iata_code' };
  }
  if (typeof targetPrice !== 'number' || targetPrice <= 0) {
    return { success: false, kind: 'prediction', reason: 'missing_or_invalid_target_price' };
  }

  const token = await getAmadeusToken();
  if (!token) {
    return { success: false, kind: 'infrastructure', reason: 'amadeus_credentials_missing_or_auth_failed' };
  }

  let entries: FlightDateEntry[];
  try {
    entries = await fetchFlightDates(from, to, token, task.ttl_ms);
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    return { success: false, kind: classifyAmadeusError(msg), reason: msg };
  }

  const filtered = filterByDateRange(entries, task.payload['date_range']);
  if (!filtered.length) {
    return { success: false, kind: 'prediction', reason: 'no_flights_found_for_route_and_date_range' };
  }

  filtered.sort((a, b) => a.price - b.price);
  const cheapest = filtered[0]!;

  if (cheapest.price > targetPrice) {
    return {
      success: false,
      kind:    'prediction',
      reason:  `price_above_target: current=${cheapest.price} target=${targetPrice}`,
    };
  }

  return {
    success:     true,
    data:        { current_price: cheapest.price, target_price: targetPrice, date: cheapest.date, from, to, currency: 'USD' },
    source:      'amadeus',
    fetchedAtMs: Date.now(),
    durationMs:  Date.now() - start,
  };
}

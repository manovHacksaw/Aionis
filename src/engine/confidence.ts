import { supabase } from '../config/supabase';

// ─── Configuration ────────────────────────────────────────────────────────────

const DECAY_RATE      = 0.05;  // per hour; gives a half-life of ~14 hours
                               // recent outcomes count more than old ones
const LAPLACE_ALPHA   = 1.0;   // smoothing constant; prevents 0 or 1 on small samples
                               // with 0 observations: confidence = 0.5 (neutral prior)
                               // with 1 success, 0 failures: ~0.75 (not 1.0)
const MIN_CONFIDENCE  = 0.10;  // floor — never fully stop trying a task type
const MAX_CONFIDENCE  = 0.95;  // ceiling — never fully trust any task type
const DEFAULT         = 0.50;  // returned when no history exists for this (agent, taskType)
const MAX_LOOKBACK    = 200;   // max outcomes to pull per query
const CACHE_TTL_MS    = 60_000; // recompute at most once per minute per (agent, taskType)

// ─── Cache ───────────────────────────────────────────────────────────────────

interface CacheEntry {
  confidence:  number;
  sampleSize:  number;
  cachedAt:    number;
}

const CACHE = new Map<string, CacheEntry>();

// Called by outcome recorder after each task completes so the next evaluation
// uses fresh data instead of waiting for the TTL to expire.
export function invalidateCache(agentId: string, taskType: string): void {
  CACHE.delete(`${agentId}:${taskType}`);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ConfidenceResult {
  confidence:  number;
  sampleSize:  number;
  source:      'computed' | 'default' | 'cache';
}

// Compute confidence for an (agent, taskType) pair.
//
// Algorithm:
//   1. Pull up to MAX_LOOKBACK recent outcomes from task_outcomes.
//   2. Weight each outcome by exp(-DECAY_RATE * age_hours) — older data matters less.
//   3. Apply Laplace smoothing to the weighted success rate — avoids overconfidence
//      on small samples and produces a neutral prior (0.5) with zero observations.
//   4. Clamp to [MIN_CONFIDENCE, MAX_CONFIDENCE].
//
// This is not machine learning. It is Bayesian reasoning from observed frequencies
// with a recency bias. It is deterministic given the same input data.
export async function computeConfidence(
  agentId:  string,
  taskType: string
): Promise<ConfidenceResult> {
  const key    = `${agentId}:${taskType}`;
  const cached = CACHE.get(key);

  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { confidence: cached.confidence, sampleSize: cached.sampleSize, source: 'cache' };
  }

  const { data, error } = await supabase
    .from('task_outcomes')
    .select('success, created_at')
    .eq('agent_id', agentId)
    .eq('task_type', taskType)
    .order('created_at', { ascending: false })
    .limit(MAX_LOOKBACK);

  if (error) throw new Error(`Confidence query failed: ${error.message}`);

  if (!data || data.length === 0) {
    return { confidence: DEFAULT, sampleSize: 0, source: 'default' };
  }

  const now = Date.now();
  let weightedSuccesses = 0;
  let totalWeight       = 0;

  for (const row of data) {
    const ageHours = (now - new Date(row.created_at as string).getTime()) / 3_600_000;
    const weight   = Math.exp(-DECAY_RATE * ageHours);
    weightedSuccesses += weight * (row.success ? 1 : 0);
    totalWeight       += weight;
  }

  const smoothed    = (weightedSuccesses + LAPLACE_ALPHA) / (totalWeight + 2 * LAPLACE_ALPHA);
  const confidence  = Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, smoothed));

  CACHE.set(key, { confidence, sampleSize: data.length, cachedAt: Date.now() });

  return { confidence, sampleSize: data.length, source: 'computed' };
}

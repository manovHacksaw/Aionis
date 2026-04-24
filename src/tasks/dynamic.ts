import { randomUUID } from 'crypto';
import type { Task } from '../types';
import type { TaskSource } from './source';

interface TaskTemplate {
  type:            string;
  baseCost:        number;
  baseRevenue:     number;
  costVariance:    number; // ± fraction, e.g. 0.2 = ±20%
  revenueVariance: number;
  availability:    number; // probability this template appears per fetch (0–1)
  ttl_ms:          number;
  payload:         Record<string, unknown>;
}

// Vary a base value by ±variance using a uniform distribution.
// Result is always a positive integer (lamports).
function vary(base: number, variance: number): number {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1, Math.round(base * factor));
}

// Task pool for Phase 2.
// Covers multiple task types, a range of margins, and variable availability.
// This gives the confidence engine real variation to learn from:
// - Some types are reliably profitable (high confidence should emerge over time)
// - Some are marginal or volatile (confidence stays moderate)
// - data_resale exists to test multi-strategy routing (stub strategy)
const TEMPLATES: TaskTemplate[] = [
  {
    type:            'bounty',
    baseCost:        1_000_000,
    baseRevenue:     3_000_000,
    costVariance:    0.20,
    revenueVariance: 0.30,
    availability:    0.85,
    ttl_ms:          5_000,
    payload:         { query: 'fetch_sol_usdc_price' },
  },
  {
    type:            'bounty',
    baseCost:          500_000,
    baseRevenue:     1_500_000,
    costVariance:    0.15,
    revenueVariance: 0.25,
    availability:    0.80,
    ttl_ms:          5_000,
    payload:         { query: 'fetch_eth_usdc_price' },
  },
  {
    type:            'bounty',
    baseCost:        2_000_000,
    baseRevenue:     2_400_000, // tight margin — will fail profit gate when confidence is low
    costVariance:    0.10,
    revenueVariance: 0.25,
    availability:    0.70,
    ttl_ms:          8_000,
    payload:         { query: 'fetch_btc_dominance' },
  },
  {
    type:            'bounty',
    baseCost:        3_000_000, // expensive — tests balance affordability gate
    baseRevenue:     7_500_000,
    costVariance:    0.05,
    revenueVariance: 0.50,     // high variance — confidence engine should stay cautious
    availability:    0.35,     // rare
    ttl_ms:          15_000,
    payload:         { query: 'deep_orderbook_analysis' },
  },
  {
    type:            'data_resale',
    baseCost:        1_500_000,
    baseRevenue:     4_000_000,
    costVariance:    0.10,
    revenueVariance: 0.40,
    availability:    0.55,
    ttl_ms:          10_000,
    payload:         { dataset: 'sol_mempool_snapshot' },
  },
];

export class DynamicTaskSource implements TaskSource {
  async fetchTasks(_agentId: string): Promise<Task[]> {
    return TEMPLATES
      .filter((t) => Math.random() < t.availability)
      .map((t) => ({
        id:      randomUUID(),
        type:    t.type,
        cost:    vary(t.baseCost, t.costVariance),
        revenue: vary(t.baseRevenue, t.revenueVariance),
        payload: { ...t.payload },
        ttl_ms:  t.ttl_ms,
      }));
  }
}

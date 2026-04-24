import { randomUUID } from 'crypto';
import type { Task } from '../types';
import type { TaskSource } from './source';

// Phase 2: confidence is removed from Task — it is always computed by the agent.
// MockTaskSource is kept for unit testing and local development without a DB.
// Tasks have fixed cost/revenue (no variability). Use DynamicTaskSource for realistic behavior.
const BOUNTY_TEMPLATES = [
  { cost: 1_000_000, revenue: 3_000_000, payload: { query: 'fetch_sol_usdc_price' }, ttl_ms: 5_000 },
  { cost:   500_000, revenue: 1_500_000, payload: { query: 'fetch_eth_usdc_price' }, ttl_ms: 5_000 },
  { cost: 2_000_000, revenue: 2_100_000, payload: { query: 'fetch_btc_dominance'  }, ttl_ms: 8_000 },
  { cost: 3_000_000, revenue: 8_000_000, payload: { query: 'predict_validator'     }, ttl_ms: 3_000 },
  { cost:   500_000, revenue:   400_000, payload: { query: 'ping_rpc'              }, ttl_ms: 2_000 },
] as const;

export class MockTaskSource implements TaskSource {
  async fetchTasks(_agentId: string): Promise<Task[]> {
    const count    = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...BOUNTY_TEMPLATES].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, count).map((t) => ({
      id:      randomUUID(),
      type:    'bounty' as const,
      cost:    t.cost,
      revenue: t.revenue,
      payload: { ...t.payload },
      ttl_ms:  t.ttl_ms,
    }));
  }
}

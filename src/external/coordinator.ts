import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import type { Task } from '../types';

// Coordinator is the external task producer and payment authority.
// In production: replace with a real external service behind COORDINATOR_URL.
// In development: mounted at /external in the same process.
//
// Responsibilities:
//   - Maintain a pool of available tasks with cost/revenue economics
//   - Accept completion reports from agents
//   - Confirm payment only for valid, non-expired, non-duplicate completions

interface CoordinatorTask extends Task {
  createdAtMs:   number;
  expiresAtMs:   number;
  completedBy:   string | null;
  completedAtMs: number | null;
}

const pool = new Map<string, CoordinatorTask>();

const TEMPLATES: Array<{
  type:     string;
  cost:     number;      // base cost in lamports
  revenue:  number;      // base revenue in lamports
  ttl_ms:   number;
  payload:  Record<string, unknown>;
  poolSize: number;      // max available at any time
}> = [
  {
    type:     'fetch_sol_usdc_price',
    cost:     1_000_000,
    revenue:  3_000_000,
    ttl_ms:   10_000,
    payload:  { symbol: 'SOL', vs_currency: 'usd', source: 'coingecko' },
    poolSize: 3,
  },
  {
    type:     'fetch_eth_usdc_price',
    cost:     800_000,
    revenue:  2_500_000,
    ttl_ms:   10_000,
    payload:  { symbol: 'ETH', vs_currency: 'usd', source: 'coingecko' },
    poolSize: 3,
  },
  {
    type:     'fetch_btc_dominance',
    cost:     600_000,
    revenue:  1_800_000,
    ttl_ms:   15_000,
    payload:  { metric: 'btc_market_cap_percentage', source: 'coingecko' },
    poolSize: 2,
  },
  {
    type:     'deep_orderbook_analysis',
    cost:     2_500_000,
    revenue:  7_000_000,
    ttl_ms:   20_000,
    payload:  { exchange: 'binance', base: 'SOL', quote: 'USDT', depth: true },
    poolSize: 1,
  },

  // Travel vertical
  {
    type:     'find_cheapest_flight',
    cost:     1_000_000,
    revenue:  4_500_000,
    ttl_ms:   30_000, // Amadeus can be slow — generous TTL
    payload:  { from: 'BOM', to: 'DXB', date_range: ['2026-06-01', '2026-06-30'] },
    poolSize: 1,
  },
  {
    type:     'track_flight_price',
    cost:       200_000, // cheap per-check — earns big only when target is met
    revenue:  3_500_000,
    ttl_ms:   25_000,
    payload:  { from: 'BOM', to: 'DXB', date_range: ['2026-06-01', '2026-06-30'], target_price: 250 },
    poolSize: 2,
  },

  // Shopping vertical — find_best_price
  // Runs all four sources (Croma, Amazon, Flipkart, Myntra) in parallel; returns lowest.
  {
    type:     'find_best_price',
    cost:       500_000,
    revenue:  2_000_000,
    ttl_ms:   30_000, // 4 parallel fetches + one verification re-fetch
    payload:  { product: 'iPhone 15 128GB', region: 'IN' },
    poolSize: 2,
  },
  {
    type:     'find_best_price',
    cost:       400_000,
    revenue:  1_600_000,
    ttl_ms:   30_000,
    payload:  { product: 'Nike Air Max running shoes', region: 'IN' }, // Myntra-relevant
    poolSize: 1,
  },

  // Shopping vertical — track_price_drop across platforms
  // Each URL targets a specific platform so agents build per-platform confidence.
  {
    type:     'track_price_drop',
    cost:       100_000,
    revenue:  2_500_000,
    ttl_ms:   20_000,
    payload:  { product_url: 'https://www.croma.com/apple-iphone-15-128-gb-black-/p/262729', target_price: 75000 },
    poolSize: 2,
  },
  {
    type:     'track_price_drop',
    cost:       100_000,
    revenue:  2_500_000,
    ttl_ms:   20_000,
    // Amazon ASIN B0CM5JN9QL = iPhone 15 128GB Black IN
    payload:  { product_url: 'https://www.amazon.in/dp/B0CM5JN9QL', target_price: 72000 },
    poolSize: 2,
  },
  {
    type:     'track_price_drop',
    cost:       100_000,
    revenue:  2_000_000,
    ttl_ms:   20_000,
    payload:  { product_url: 'https://www.flipkart.com/apple-iphone-15/p/itm6ac6485515ae4', target_price: 71000 },
    poolSize: 1,
  },
];

// Apply ±variance% uniform noise to a base value.
function vary(base: number, variance: number): number {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1, Math.round(base * factor));
}

function replenishPool(): void {
  const now = Date.now();

  // Evict expired uncompleted tasks to prevent stale IDs from accumulating.
  for (const [id, task] of pool) {
    if (task.completedBy === null && task.expiresAtMs < now) {
      pool.delete(id);
    }
  }

  // Count available (uncompleted, unexpired) tasks per type.
  const countByType = new Map<string, number>();
  for (const task of pool.values()) {
    if (task.completedBy === null && task.expiresAtMs > now) {
      countByType.set(task.type, (countByType.get(task.type) ?? 0) + 1);
    }
  }

  // Fill each type to its poolSize with market-realistic cost/revenue variance.
  for (const tpl of TEMPLATES) {
    const deficit = tpl.poolSize - (countByType.get(tpl.type) ?? 0);
    for (let i = 0; i < deficit; i++) {
      const id         = randomUUID();
      const createdAtMs = Date.now();
      pool.set(id, {
        id,
        type:          tpl.type,
        cost:          vary(tpl.cost,    0.10),
        revenue:       vary(tpl.revenue, 0.20),
        payload:       { ...tpl.payload },
        ttl_ms:        tpl.ttl_ms,
        createdAtMs,
        expiresAtMs:   createdAtMs + tpl.ttl_ms,
        completedBy:   null,
        completedAtMs: null,
      });
    }
  }
}

// Seed the pool at startup.
replenishPool();

// Replenish every 5 seconds. unref() prevents this from blocking process exit.
const interval = setInterval(replenishPool, 5_000);
interval.unref();

export const coordinatorRouter = Router();

// GET /external/tasks?agent_id=UUID&limit=N
coordinatorRouter.get('/tasks', (req: Request, res: Response) => {
  const agentId = req.query['agent_id'] as string | undefined;
  if (!agentId) {
    res.status(400).json({ error: 'agent_id is required' });
    return;
  }

  const limit = Math.min(parseInt(req.query['limit'] as string ?? '5', 10), 10);
  const now   = Date.now();

  replenishPool();

  const available: CoordinatorTask[] = [];
  for (const task of pool.values()) {
    if (task.completedBy === null && task.expiresAtMs > now) {
      available.push(task);
    }
    if (available.length >= limit) break;
  }

  res.json({
    tasks: available.map((t) => ({
      id:         t.id,
      type:       t.type,
      cost:       t.cost,
      revenue:    t.revenue,
      payload:    t.payload,
      ttl_ms:     t.ttl_ms,
      expires_at: new Date(t.expiresAtMs).toISOString(),
    })),
    cursor: null,
  });
});

// POST /external/tasks/:id/complete
coordinatorRouter.post('/tasks/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = pool.get(id!);

  if (!task) {
    res.status(404).json({ error: 'task_not_found' });
    return;
  }

  const body = req.body as {
    agent_id?:     string;
    result?:       Record<string, unknown>;
    execution_ms?: number;
  };

  if (!body.agent_id) {
    res.status(400).json({ error: 'agent_id is required' });
    return;
  }

  if (task.completedBy !== null) {
    res.json({ confirmed: false, task_id: id, reason: 'already_completed' });
    return;
  }

  if (task.expiresAtMs < Date.now()) {
    res.json({ confirmed: false, task_id: id, reason: 'expired' });
    return;
  }

  // Result must be a non-empty object — ensures the agent actually did work.
  if (
    !body.result ||
    typeof body.result !== 'object' ||
    Array.isArray(body.result) ||
    Object.keys(body.result).length === 0
  ) {
    res.json({ confirmed: false, task_id: id, reason: 'invalid_result' });
    return;
  }

  task.completedBy   = body.agent_id;
  task.completedAtMs = Date.now();

  res.json({ confirmed: true, task_id: id, revenue: task.revenue });
});

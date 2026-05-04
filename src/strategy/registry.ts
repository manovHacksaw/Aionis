import { executeBounty } from './bounty';
import { executeDataResale } from './dataResale';
import { executeDataFetch } from './dataFetch';
import type { Task, Outcome, ProfitEvaluation } from '../types';

export type StrategyExecutor = (
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation
) => Promise<Outcome>;

// Map task types to their execution strategies.
// To add a new strategy: implement the function, register it here.
const REGISTRY = new Map<string, StrategyExecutor>([
  // Phase 1–2: simulated work (retained for backward compat and local dev)
  ['bounty',                  executeBounty],
  ['data_resale',             executeDataResale],

  // Phase 3: real work via external APIs + payment confirmation
  ['fetch_sol_usdc_price',    executeDataFetch],
  ['fetch_eth_usdc_price',    executeDataFetch],
  ['fetch_btc_dominance',     executeDataFetch],
  ['deep_orderbook_analysis', executeDataFetch],

  // Travel vertical
  ['find_cheapest_flight',    executeDataFetch],
  ['track_flight_price',      executeDataFetch],

  // Shopping vertical
  ['find_best_price',         executeDataFetch],
  ['track_price_drop',        executeDataFetch],
]);

export function getStrategy(taskType: string): StrategyExecutor | null {
  return REGISTRY.get(taskType) ?? null;
}

export function supportedTypes(): string[] {
  return [...REGISTRY.keys()];
}

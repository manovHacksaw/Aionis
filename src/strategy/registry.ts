import { executeBounty } from './bounty';
import { executeDataResale } from './dataResale';
import type { Task, Outcome, ProfitEvaluation } from '../types';

export type StrategyExecutor = (
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation
) => Promise<Outcome>;

// Map task types to their execution strategies.
// To add a new strategy: implement the function, register it here.
const REGISTRY = new Map<string, StrategyExecutor>([
  ['bounty',      executeBounty],
  ['data_resale', executeDataResale],
]);

export function getStrategy(taskType: string): StrategyExecutor | null {
  return REGISTRY.get(taskType) ?? null;
}

export function supportedTypes(): string[] {
  return [...REGISTRY.keys()];
}

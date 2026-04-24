import type { Task, ProfitEvaluation } from '../types';

// Confidence is now an explicit parameter — always passed in from the confidence engine.
// This function is intentionally pure (no I/O, no side effects).
// The profit gate remains the final authority: no strategy executes if this returns false.
export function evaluateProfit(task: Task, confidence: number): ProfitEvaluation {
  const expectedRevenue = Math.floor(task.revenue * confidence);
  const expectedProfit  = expectedRevenue - task.cost;

  return {
    profitable:      expectedProfit > 0,
    expectedProfit,
    expectedRevenue,
    cost:            task.cost,
    confidence,
  };
}

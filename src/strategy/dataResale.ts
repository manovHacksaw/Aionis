import * as balance from '../engine/balance';
import { recordOutcome } from '../outcomes/record';
import type { Task, Outcome, ProfitEvaluation } from '../types';

// STUB — Phase 2: routing is wired, execution is not.
// This demonstrates multi-strategy support without a real implementation.
// Replace with: acquire data → package it → resell to a buyer agent or external party.
export async function executeDataResale(
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation
): Promise<Outcome> {
  const spendTxId = await balance.spend(agentId, task.cost, {
    taskId:   task.id,
    taskType: task.type,
    note:     'data_resale_stub',
  });

  // Simulate acquiring and reselling (always succeeds in stub)
  const start = Date.now();
  await new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 400)));
  const executionMs = Date.now() - start;

  const netProfit = task.revenue - task.cost;
  const earnTxId  = await balance.resale(agentId, task.revenue, {
    taskId:      task.id,
    taskType:    task.type,
    netProfit,
    executionMs,
    spendTxId,
    note:        'data_resale_stub',
  });

  await recordOutcome({
    agentId,
    taskType:       task.type,
    taskId:         task.id,
    success:        true,
    cost:           task.cost,
    revenue:        task.revenue,
    actualProfit:   netProfit,
    expectedProfit: evaluation.expectedProfit,
    confidenceUsed: evaluation.confidence,
    executionMs,
  });

  return {
    taskId:    task.id,
    taskType:  task.type,
    succeeded: true,
    revenue:   task.revenue,
    cost:      task.cost,
    netProfit,
    spendTxId,
    earnTxId,
    executionMs,
  };
}

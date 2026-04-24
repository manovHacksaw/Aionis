import * as balance from '../engine/balance';
import { recordOutcome } from '../outcomes/record';
import type { Task, Outcome, ProfitEvaluation } from '../types';

async function performWork(task: Task): Promise<number> {
  const start = Date.now();
  const delay = Math.min(200 + Math.floor(Math.random() * 800), task.ttl_ms - 50);
  await new Promise((r) => setTimeout(r, delay));

  if (Math.random() < 0.1) {
    throw new Error(`Simulated execution failure for task ${task.id}`);
  }

  return Date.now() - start;
}

export async function executeBounty(
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation
): Promise<Outcome> {
  // Step 1: Atomic spend — debit before work starts.
  const spendTxId = await balance.spend(agentId, task.cost, {
    taskId:         task.id,
    taskType:       task.type,
    expectedProfit: evaluation.expectedProfit,
    confidence:     evaluation.confidence,
  });

  let executionMs: number;
  try {
    // Step 2: Perform work.
    executionMs = await performWork(task);
  } catch (err) {
    // Step 3a: System failure — refund cost. The agent should not absorb losses
    // from infrastructure failures, only from bad predictions.
    await balance.earn(agentId, task.cost, {
      taskId:   task.id,
      type:     'cost_refund',
      reason:   (err as Error).message,
      spendTxId,
    });

    await recordOutcome({
      agentId,
      taskType:       task.type,
      taskId:         task.id,
      success:        false,
      cost:           task.cost,
      revenue:        0,
      actualProfit:   0, // cost was refunded, net = 0
      expectedProfit: evaluation.expectedProfit,
      confidenceUsed: evaluation.confidence,
    });

    return {
      taskId:    task.id,
      taskType:  task.type,
      succeeded: false,
      revenue:   0,
      cost:      task.cost,
      netProfit: 0,
      spendTxId,
    };
  }

  // Step 3b: Success — earn the reward.
  const netProfit = task.revenue - task.cost;
  const earnTxId  = await balance.earn(agentId, task.revenue, {
    taskId:      task.id,
    taskType:    task.type,
    executionMs,
    netProfit,
    spendTxId,
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

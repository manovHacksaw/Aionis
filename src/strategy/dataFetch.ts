import * as balance from '../engine/balance';
import { recordOutcome } from '../outcomes/record';
import { performWork } from '../work/handlers';
import { confirmTaskComplete } from '../external/confirm';
import { env } from '../config/env';
import type { Task, Outcome, ProfitEvaluation } from '../types';

// Prediction failure: the agent executed but did not earn (expired, rejected, bad result).
// Cost is absorbed — this is a real economic loss and a signal for the confidence engine.
async function absorb(
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation,
  spendTxId:  string,
  executionMs: number,
): Promise<Outcome> {
  await recordOutcome({
    agentId,
    taskType:       task.type,
    taskId:         task.id,
    success:        false,
    cost:           task.cost,
    revenue:        0,
    actualProfit:   -task.cost,
    expectedProfit: evaluation.expectedProfit,
    confidenceUsed: evaluation.confidence,
    executionMs,
  });
  return {
    taskId:    task.id,
    taskType:  task.type,
    succeeded: false,
    revenue:   0,
    cost:      task.cost,
    netProfit: -task.cost,
    spendTxId,
    executionMs,
  };
}

// Infrastructure failure: the system (network, coordinator, API) failed — not the agent.
// Cost is refunded via a cost_refund earn transaction. Net balance impact = 0.
// This does NOT count as a failure signal for the confidence engine.
async function refund(
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation,
  spendTxId:  string,
  reason:     string,
  executionMs: number,
): Promise<Outcome> {
  const earnTxId = await balance.earn(agentId, task.cost, {
    taskId:   task.id,
    type:     'cost_refund',
    reason,
    spendTxId,
  });
  await recordOutcome({
    agentId,
    taskType:       task.type,
    taskId:         task.id,
    success:        false,
    cost:           task.cost,
    revenue:        0,
    actualProfit:   0, // cost was refunded, net impact is zero
    expectedProfit: evaluation.expectedProfit,
    confidenceUsed: evaluation.confidence,
    executionMs,
  });
  return {
    taskId:    task.id,
    taskType:  task.type,
    succeeded: false,
    revenue:   0,
    cost:      task.cost,
    netProfit: 0,
    spendTxId,
    earnTxId,
    executionMs,
  };
}

// Real Phase 3 strategy executor.
//
// Execution sequence:
//   1. Spend (debit cost atomically — Rule S1)
//   2. Perform real work (CoinGecko API call via work/handlers.ts)
//   3. Confirm payment with coordinator
//   4. Earn confirmed revenue OR classify and handle failure
//
// Failure classification (see external/confirm.ts and work/types.ts):
//   infrastructure (network, 5xx) → refund cost
//   prediction (bad result, expired, rejected) → absorb cost
export async function executeDataFetch(
  agentId:    string,
  task:       Task,
  evaluation: ProfitEvaluation,
): Promise<Outcome> {

  // Step 1: Atomic spend — debit before work starts (Rule S1).
  const spendTxId = await balance.spend(agentId, task.cost, {
    taskId:         task.id,
    taskType:       task.type,
    expectedProfit: evaluation.expectedProfit,
    confidence:     evaluation.confidence,
  });

  const execStart = Date.now();

  // Step 2: Perform real work. performWork dispatches by task.type.
  const workResult = await performWork(task);
  const executionMs = Date.now() - execStart;

  if (!workResult.success) {
    return workResult.kind === 'infrastructure'
      ? refund(agentId, task, evaluation, spendTxId, workResult.reason, executionMs)
      : absorb(agentId, task, evaluation, spendTxId, executionMs);
  }

  // Step 3: Work succeeded — request payment confirmation from coordinator.
  const confirmResult = await confirmTaskComplete(env.coordinatorUrl, task.id, {
    agent_id:     agentId,
    result:       workResult.data,
    execution_ms: executionMs,
  });

  if (!confirmResult.confirmed) {
    return confirmResult.kind === 'infrastructure'
      ? refund(agentId, task, evaluation, spendTxId, confirmResult.reason, executionMs)
      : absorb(agentId, task, evaluation, spendTxId, executionMs);
  }

  // Step 4: Payment confirmed — earn the confirmed revenue (Rule S2).
  const confirmedRevenue = confirmResult.revenue;
  const netProfit        = confirmedRevenue - task.cost;

  const earnTxId = await balance.earn(agentId, confirmedRevenue, {
    taskId:      task.id,
    taskType:    task.type,
    executionMs,
    netProfit,
    spendTxId,
    workSource:  workResult.source,
  });

  await recordOutcome({
    agentId,
    taskType:       task.type,
    taskId:         task.id,
    success:        true,
    cost:           task.cost,
    revenue:        confirmedRevenue,
    actualProfit:   netProfit,
    expectedProfit: evaluation.expectedProfit,
    confidenceUsed: evaluation.confidence,
    executionMs,
  });

  return {
    taskId:    task.id,
    taskType:  task.type,
    succeeded: true,
    revenue:   confirmedRevenue,
    cost:      task.cost,
    netProfit,
    spendTxId,
    earnTxId,
    executionMs,
  };
}

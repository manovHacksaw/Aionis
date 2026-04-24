import { supabase } from '../config/supabase';
import { invalidateCache } from '../engine/confidence';

export interface OutcomeRecord {
  agentId:        string;
  taskType:       string;
  taskId:         string;
  success:        boolean;
  cost:           number;
  revenue:        number; // actual revenue (0 on failure)
  actualProfit:   number; // net balance impact (0 for refunded failures)
  expectedProfit: number; // what the profit engine predicted
  confidenceUsed: number; // confidence score at decision time
  executionMs?:   number;
}

// Records a task outcome for the confidence engine.
//
// This is intentionally NOT atomic with balance operations.
// The transactions table is the financial ledger — it must be consistent.
// This table is an analytics signal — if a write fails, the agent loses
// one data point, not money. We log the warning and move on.
export async function recordOutcome(record: OutcomeRecord): Promise<void> {
  const { error } = await supabase.from('task_outcomes').insert({
    agent_id:        record.agentId,
    task_type:       record.taskType,
    task_id:         record.taskId,
    success:         record.success,
    cost:            record.cost,
    revenue:         record.revenue,
    actual_profit:   record.actualProfit,
    expected_profit: record.expectedProfit,
    confidence_used: record.confidenceUsed,
    execution_ms:    record.executionMs ?? null,
  });

  if (error) {
    console.warn(`[outcomes] Failed to record task ${record.taskId}: ${error.message}`);
    return;
  }

  // Invalidate the confidence cache so the next evaluation uses fresh data.
  invalidateCache(record.agentId, record.taskType);
}

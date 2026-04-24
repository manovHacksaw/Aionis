import { supabase } from '../config/supabase';

// All public functions here are backed by atomic Postgres stored procedures.
// Balance update + transaction log always commit together or not at all.
// Never replicate this logic as two separate Supabase calls.

export class BalanceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'BalanceError';
  }
}

type RpcResult = { success: boolean; error?: string; transaction_id?: string };

async function callRpc(
  fn: string,
  params: Record<string, unknown>
): Promise<string> {
  const { data, error } = await supabase.rpc(fn, params);

  if (error) {
    throw new BalanceError(`Database error in ${fn}: ${error.message}`, 'db_error');
  }

  const result = data as RpcResult;

  if (!result?.success) {
    const code = result?.error ?? 'unknown';
    throw new BalanceError(code.replace(/_/g, ' '), code);
  }

  return result.transaction_id!;
}

// Debit amount from agent balance. Throws if balance insufficient or agent inactive.
// Returns the transaction ID of the logged spend.
export async function spend(
  agentId: string,
  amount: number,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new BalanceError('Amount must be a positive integer (lamports)', 'invalid_amount');
  }
  return callRpc('record_spend', {
    p_agent_id: agentId,
    p_amount:   amount,
    p_metadata: metadata,
  });
}

// Credit amount to agent balance. Used when a task pays out successfully.
// Returns the transaction ID of the logged earn.
export async function earn(
  agentId: string,
  amount: number,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new BalanceError('Amount must be a positive integer (lamports)', 'invalid_amount');
  }
  return callRpc('record_earn', {
    p_agent_id: agentId,
    p_amount:   amount,
    p_metadata: metadata,
  });
}

// Credit amount to agent balance from reselling computation to another party.
// Returns the transaction ID of the logged resale.
export async function resale(
  agentId: string,
  amount: number,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new BalanceError('Amount must be a positive integer (lamports)', 'invalid_amount');
  }
  return callRpc('record_resale', {
    p_agent_id: agentId,
    p_amount:   amount,
    p_metadata: metadata,
  });
}

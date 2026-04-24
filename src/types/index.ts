export type AgentStatus    = 'active' | 'paused' | 'terminated';
export type TransactionType = 'spend' | 'earn' | 'resale';
export type StrategyType   = 'bounty' | 'data_resale';

export interface Agent {
  id:                    string;
  wallet:                string;
  encrypted_private_key: string;
  balance:               number; // lamports — BIGINT in Postgres
  strategy:              StrategyType;
  status:                AgentStatus;
  created_at:            string;
}

export interface Transaction {
  id:         string;
  agent_id:   string;
  type:       TransactionType;
  amount:     number; // lamports
  profit:     number; // net economic impact: negative for spends, positive for earns
  metadata:   Record<string, unknown> | null;
  created_at: string;
}

// Phase 2: confidence is REMOVED from Task.
// cost and revenue are external market signals (provided by the task source).
// confidence is internal — always computed by the agent's own confidence engine.
// Separating these two is what makes the profit formula honest.
export interface Task {
  id:      string;
  type:    string;   // matches a registered strategy key
  cost:    number;   // lamports the agent pays to attempt
  revenue: number;   // lamports the agent receives on success
  payload: Record<string, unknown>;
  ttl_ms:  number;
}

export interface ProfitEvaluation {
  profitable:     boolean;
  expectedProfit: number; // (revenue × confidence) - cost, in lamports
  expectedRevenue: number; // revenue × confidence, in lamports
  cost:           number;
  confidence:     number; // the computed value used — stored for audit
}

// Unified outcome type returned by all strategies.
// Replaces Phase 1's BountyOutcome with a type all strategies share.
export interface Outcome {
  taskId:       string;
  taskType:     string;
  succeeded:    boolean;
  revenue:      number;  // actual revenue (0 if failed)
  cost:         number;
  netProfit:    number;  // revenue - cost (0 if refunded failure)
  spendTxId:    string;
  earnTxId?:    string;
  executionMs?: number;
}

-- AutoFi Phase 2 Schema Additions
-- Run this AFTER schema.sql (Phase 1) has been applied.

-- task_outcomes: analytics table for the confidence engine.
-- NOT a financial ledger — writes here are best-effort, not atomic with balance ops.
-- Purpose: record the outcome of every task execution so confidence can be computed
--          from real historical signal rather than hardcoded constants.
CREATE TABLE IF NOT EXISTS task_outcomes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id        UUID        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    task_type       TEXT        NOT NULL,
    task_id         TEXT        NOT NULL,  -- external ID, not a FK
    success         BOOLEAN     NOT NULL,
    cost            BIGINT      NOT NULL,
    revenue         BIGINT      NOT NULL,  -- actual revenue received (0 on failure)
    actual_profit   BIGINT      NOT NULL,  -- revenue - cost (0 on refunded failure)
    expected_profit BIGINT      NOT NULL,  -- what the profit engine predicted
    confidence_used NUMERIC(6,5) NOT NULL, -- confidence score used at decision time
    execution_ms    INTEGER,               -- null if work never started
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary access pattern: "give me recent outcomes for this agent + task type"
CREATE INDEX IF NOT EXISTS idx_task_outcomes_agent_type_time
    ON task_outcomes(agent_id, task_type, created_at DESC);

-- Secondary: per-agent audit
CREATE INDEX IF NOT EXISTS idx_task_outcomes_agent_id
    ON task_outcomes(agent_id, created_at DESC);

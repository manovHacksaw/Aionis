-- AutoFi Phase 1 Schema
-- NOTE: balance uses BIGINT (lamports), NOT float.
-- Float is unsuitable for financial values due to IEEE 754 rounding errors.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agents (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet               TEXT        NOT NULL UNIQUE,
    encrypted_private_key TEXT       NOT NULL,
    balance              BIGINT      NOT NULL DEFAULT 0 CHECK (balance >= 0),
    strategy             TEXT        NOT NULL DEFAULT 'bounty'
                                     CHECK (strategy IN ('bounty')),
    status               TEXT        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'paused', 'terminated')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id   UUID        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    type       TEXT        NOT NULL CHECK (type IN ('spend', 'earn', 'resale')),
    amount     BIGINT      NOT NULL CHECK (amount > 0),
    -- profit convention: net economic impact of this event.
    --   spend  → profit = -amount  (you paid this)
    --   earn   → profit = +amount  (you received this)
    --   resale → profit = +amount  (you received this)
    -- SUM(profit) across all agent transactions = net economic position.
    profit     BIGINT      NOT NULL,
    metadata   JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Future: memoized computation results
CREATE TABLE IF NOT EXISTS cache (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash  TEXT        NOT NULL UNIQUE,
    result      JSONB       NOT NULL,
    cost        BIGINT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_transactions_agent_id   ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_status           ON agents(status);
CREATE INDEX IF NOT EXISTS idx_cache_query_hash        ON cache(query_hash);

-- ─── Atomic Functions ─────────────────────────────────────────────────────────
-- These run as implicit Postgres transactions: balance update + transaction log
-- are committed together or not at all. Never call them from separate API requests.

-- Atomic spend: debit balance, fail if insufficient or agent inactive.
CREATE OR REPLACE FUNCTION record_spend(
    p_agent_id UUID,
    p_amount   BIGINT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_updated INT;
    v_tx_id   UUID;
BEGIN
    UPDATE agents
    SET balance = balance - p_amount
    WHERE id = p_agent_id
      AND balance >= p_amount
      AND status = 'active';

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error',   'insufficient_balance_or_agent_inactive'
        );
    END IF;

    INSERT INTO transactions (agent_id, type, amount, profit, metadata)
    VALUES (p_agent_id, 'spend', p_amount, -p_amount, p_metadata)
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id);
END;
$$ LANGUAGE plpgsql;

-- Atomic earn: credit balance unconditionally (agent must not be terminated).
CREATE OR REPLACE FUNCTION record_earn(
    p_agent_id UUID,
    p_amount   BIGINT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_updated INT;
    v_tx_id   UUID;
BEGIN
    UPDATE agents
    SET balance = balance + p_amount
    WHERE id = p_agent_id
      AND status != 'terminated';

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error',   'agent_not_found_or_terminated'
        );
    END IF;

    INSERT INTO transactions (agent_id, type, amount, profit, metadata)
    VALUES (p_agent_id, 'earn', p_amount, p_amount, p_metadata)
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id);
END;
$$ LANGUAGE plpgsql;

-- Atomic resale: credit balance for computation resold to another party.
CREATE OR REPLACE FUNCTION record_resale(
    p_agent_id UUID,
    p_amount   BIGINT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_updated INT;
    v_tx_id   UUID;
BEGIN
    UPDATE agents
    SET balance = balance + p_amount
    WHERE id = p_agent_id
      AND status != 'terminated';

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error',   'agent_not_found_or_terminated'
        );
    END IF;

    INSERT INTO transactions (agent_id, type, amount, profit, metadata)
    VALUES (p_agent_id, 'resale', p_amount, p_amount, p_metadata)
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id);
END;
$$ LANGUAGE plpgsql;

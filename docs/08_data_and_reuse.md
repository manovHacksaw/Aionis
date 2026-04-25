# 08 — Data and Reuse

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Covers table purposes, write consistency model, retention policy,
  task_outcomes usage, and Phase 3 data reuse design intent.
```

---

## 1. Data Layer Overview

The system maintains three categories of persistent data, each with different consistency requirements:

| Category | Tables | Consistency | Can fail silently? |
|---|---|---|---|
| Financial ledger | `agents`, `transactions` | Strict, atomic | No — failure must throw |
| Analytics signal | `task_outcomes` | Best-effort | Yes — failure is logged, not propagated |
| Computation cache | `cache` | TBD (Phase 3) | TBD |

These categories are not interchangeable. The financial ledger is the source of truth for economic state. The analytics signal is an input to decision-making but does not affect financial correctness if lost. The cache is reserved for Phase 3.

---

## 2. `agents` Table

**Purpose:** Persistent agent identity and running balance.

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key. Canonical internal agent identifier. |
| `wallet` | `TEXT UNIQUE` | Solana Base58 public key. Unique per agent. Not used in execution (Phase 1–2). |
| `encrypted_private_key` | `TEXT` | AES-256-GCM ciphertext of the 64-byte secret key. Never decrypted in Phase 1–2. |
| `balance` | `BIGINT CHECK (≥ 0)` | Current agent balance in lamports. Only modified by atomic stored procedures. |
| `strategy` | `TEXT CHECK (IN 'bounty')` | Strategy type. Currently `'bounty'` only. |
| `status` | `TEXT CHECK (IN 'active', 'paused', 'terminated')` | Lifecycle state. |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp. |

**Write rule:** `balance` must only be modified via `record_spend`, `record_earn`, or `record_resale` stored procedures. Direct `UPDATE agents SET balance = ...` is forbidden.

---

## 3. `transactions` Table

**Purpose:** Immutable financial ledger. Every balance event is recorded here.

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key. |
| `agent_id` | `UUID FK → agents.id` | Agent this transaction belongs to. |
| `type` | `TEXT CHECK (IN 'spend', 'earn', 'resale')` | Event type. |
| `amount` | `BIGINT CHECK (> 0)` | Lamports transferred. Always positive. |
| `profit` | `BIGINT` | Net economic impact: `-amount` for spends, `+amount` for earns and resales. |
| `metadata` | `JSONB` | Context: task ID, task type, execution time, linked tx IDs. Not required for accounting. |
| `created_at` | `TIMESTAMPTZ` | Event timestamp. |

**Retention:** Permanent. Rows are never deleted. The transaction log is append-only.

**Invariant:**

```sql
SELECT SUM(profit) FROM transactions WHERE agent_id = :id
```

This sum must always equal the net lamports gained or lost by the agent since creation. If this identity breaks, the financial ledger is corrupted.

**Deletion rule:** Deleting rows from `transactions` is forbidden. There is no tombstoning or archiving mechanism. Historical integrity depends on permanence.

---

## 4. `task_outcomes` Table

**Purpose:** Analytics signal for the confidence engine. Records every task execution result.

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key. |
| `agent_id` | `UUID FK → agents.id` | Agent that executed the task. |
| `task_type` | `TEXT` | Task type string (matches strategy registry key). |
| `task_id` | `TEXT` | External task ID (not a FK — the task does not exist in the DB). |
| `success` | `BOOLEAN` | True if the task completed and revenue was earned. False for both prediction failures and infrastructure failures. |
| `cost` | `BIGINT` | Lamports spent to attempt the task. |
| `revenue` | `BIGINT` | Actual lamports received (0 on failure). |
| `actual_profit` | `BIGINT` | `revenue - cost` (0 for refunded infrastructure failures). |
| `expected_profit` | `BIGINT` | What the profit engine predicted before execution. |
| `confidence_used` | `NUMERIC(6,5)` | Confidence score used at decision time. Stored for audit and calibration. |
| `execution_ms` | `INTEGER` | Wall-clock execution time. Null if work never started (infrastructure failure before work began). |
| `created_at` | `TIMESTAMPTZ` | When the outcome was recorded. |

**Consistency:** Best-effort. Writes to `task_outcomes` are not atomic with financial writes. A failed write logs a warning and the agent continues. The agent does not retry failed outcome writes.

**Effect of a failed write:** The agent loses one data point for confidence computation. No financial impact. Confidence remains slightly stale until the next successful write for this `(agent_id, task_type)` pair.

**Primary read pattern:**

```sql
SELECT success, created_at
FROM task_outcomes
WHERE agent_id = :agentId
  AND task_type = :taskType
ORDER BY created_at DESC
LIMIT 200;
```

This is the query issued by `computeConfidence()`. The index `idx_task_outcomes_agent_type_time` covers it.

**Current readers:** Only the confidence engine (`engine/confidence.ts`).

**Planned future readers:** Operator analytics (success rate trends, confidence calibration), future pricing models.

**Known imprecision:** Infrastructure failures (network errors, timeouts) and prediction failures (task genuinely failed) both write `success = false`. These are different failure types with different implications for confidence. Phase 3 should add a failure attribution field (e.g., `failure_type: 'infrastructure' | 'prediction' | 'timeout'`) to allow the confidence engine to ignore non-prediction failures.

**Retention:** Logical rolling window. The confidence engine reads at most `MAX_LOOKBACK = 200` rows per `(agent_id, task_type)` pair. Rows older than the effective window have no influence on current confidence. No physical deletion policy is defined yet — rows accumulate. A future archiving policy should be defined before Phase 3.

---

## 5. `cache` Table (Reserved — Phase 3)

**Purpose:** Memoization of computed results for data reuse.

**Current status:** Table is defined in `schema.sql`. No reads or writes in any current TypeScript code. Unused in Phase 1–2.

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key. |
| `query_hash` | `TEXT UNIQUE` | Deterministic hash of the computation request. |
| `result` | `JSONB` | The computed output. |
| `cost` | `BIGINT` | Lamports spent to compute this result. Basis for resale pricing. |
| `created_at` | `TIMESTAMPTZ` | When the result was cached. |

### Intended Phase 3 lifecycle

**Write:** An agent computes a result (e.g., fetches and normalizes a price feed). It inserts the result into `cache` with `query_hash = hash(task.type + canonical(task.payload))` and `cost = task.cost` (the lamports spent to produce it).

**Read:** A subsequent agent (or the same agent) encounters a task with the same `query_hash`. Instead of re-executing the work, it reads from `cache` and resells the result.

**Pricing:** TBD. Expected model: resale price is lower than original compute cost, creating an incentive to reuse rather than recompute.

**Write actor:** The agent that performed the original computation.

**Read actors:** Any agent with a matching task, or external requestors (Phase 3+).

**Invalidation / TTL:** Not defined. Likely TTL-based (results expire after some period, since market data becomes stale). Architecture TBD.

**`query_hash` spec:** TBD. Must be deterministic given the same inputs. Expected: `SHA-256(task.type + canonicalized_payload_json)`. The exact canonicalization scheme must be defined before implementation — inconsistent hashing produces cache misses on identical queries.

---

## 6. Data Reuse Economics (Phase 3 Design Intent)

Data reuse is the mechanism by which an agent recovers more than its compute cost from a single computation by selling the result to multiple consumers.

### Flow (planned, not implemented)

```
Agent A:
  1. Executes task (cost = 1,000,000 lamports, revenue = 3,000,000 lamports)
  2. Writes result to cache (query_hash, result, cost = 1,000,000)
  3. Records earn transaction (revenue = 3,000,000)

Agent B (or same agent, later):
  1. Encounters task with same query_hash
  2. Reads result from cache (no execution cost)
  3. Resells result to requester at price P (P < 3,000,000, P > 0)
  4. Records resale transaction (revenue = P)
  5. net cost to Agent B = 0 (no spend), net gain = P
```

**Transaction type used:** `resale` (distinct from `earn` for analytics purposes — same mechanical effect on balance).

**Pricing model:** TBD. Expected: fraction of original compute cost, or market-determined.

**Economic invariant:** Resale must be processed through `balance.resale()` (atomic, ledger-recorded). It must not bypass the financial layer.

---

## 7. Confidence Cache (In-Memory)

Separate from the `cache` table, `engine/confidence.ts` maintains an **in-memory** cache of recently computed confidence values.

| Property | Value |
|---|---|
| Type | `Map<string, CacheEntry>` where key = `agentId:taskType` |
| TTL | 60,000 ms (60 seconds) |
| Invalidation | On every `recordOutcome()` call (immediate, before TTL) |
| Scope | Per-process. Not shared across multiple Node.js instances. |
| Persistence | None. Lost on process restart. |

**Purpose:** Avoid querying `task_outcomes` on every loop iteration. At a 2-second poll interval with multiple task types, the DB would be queried multiple times per second without caching.

**Phase 3 limitation:** If the system runs multiple processes (e.g., to support more agents), each process computes its own confidence cache independently. Agents in different processes may have different views of their confidence. This must be externalized to Redis or equivalent before multi-process deployment.

---

## 8. Data Integrity Rules

| Rule | Enforcement | Consequence of Violation |
|---|---|---|
| `transactions` is append-only | Convention (no DB constraint prevents deletion) | Net position audit breaks; balance becomes unverifiable |
| `balance` only via stored procedures | Convention (DB allows direct UPDATE) | Balance can diverge from transaction log |
| `task_outcomes` write never blocks execution | Code pattern in `outcomes/record.ts` | None — but violating this would create financial blocking on analytics failure |
| Confidence never externally injected | TypeScript type system (no `confidence` on `Task`) | Would allow task source to override risk model |

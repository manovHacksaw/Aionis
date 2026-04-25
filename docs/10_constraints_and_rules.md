# 10 — Constraints and Rules

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Documents all hard invariants, developer-facing rules,
  operator rules, naming conventions, and locked decisions.
```

---

## 1. Core Principle

Where behavior is not enforced by code, it must be treated as a critical invariant by developers.

Several constraints in this system cannot be checked by the TypeScript compiler or the database. Violating them does not produce an immediate error — it produces silent financial corruption, incorrect confidence, or security failures. These constraints require developer discipline.

---

## 2. Financial Invariants (Hard — DB Enforced)

These cannot be violated by application code because the database rejects the operation.

| Invariant | Enforcement | What breaks if violated |
|---|---|---|
| `agents.balance >= 0` | `CHECK (balance >= 0)` constraint | Enforced by Postgres — UPDATE fails |
| `transactions.amount > 0` | `CHECK (amount > 0)` constraint | Enforced by Postgres — INSERT fails |
| Spend requires `status = 'active'` | `record_spend` checks status | Agent not active → RPC returns `{ success: false }` |
| Earn requires `status != 'terminated'` | `record_earn` checks status | Agent terminated → RPC returns `{ success: false }` |
| Balance update + transaction log are atomic | Postgres stored procedures | Enforced by implicit Postgres transaction |

---

## 3. Financial Rules (Hard — Convention Enforced)

These are not enforced by the compiler or database. Violating them corrupts financial state without immediate detection.

### Rule F1: Balance must only be modified via stored procedures

**Rule:** Never call `supabase.from('agents').update({ balance: ... })` directly. All balance changes must go through `engine/balance.ts` → Postgres RPC.

**Why:** Direct updates bypass the atomicity guarantee. The balance and the transaction log can diverge, making `SUM(profit)` an unreliable audit tool.

**Violation symptom:** `agents.balance` does not equal `balance_initial + SUM(transactions.profit WHERE agent_id = X)`.

### Rule F2: Transactions are append-only

**Rule:** Never delete rows from `transactions`. Never update `amount` or `profit` after insert.

**Why:** The transaction log is the source of truth for economic history. Deletion or mutation breaks the audit trail and makes it impossible to verify the agent's net position.

**Violation symptom:** `SUM(profit)` does not match the observed balance history.

### Rule F3: `profit` sign convention must not change

**Rule:**
- `spend` → `profit = -amount`
- `earn` → `profit = +amount`
- `resale` → `profit = +amount`

**Why:** All financial aggregation relies on `SUM(profit)`. Changing the sign convention on new rows without migrating old rows produces incorrect totals.

**Locked:** This convention cannot be changed without a full data migration.

### Rule F4: `encrypted_private_key` must never be exposed

**Rule:** Never return `encrypted_private_key` in any API response, log output, or error message.

**Current enforcement:** `routes/agent.ts` destructures and omits it before serialization:
```ts
const { encrypted_private_key: _omit, ...safeAgent } = agent;
```

**Violation consequence:** Exposure of the ciphertext combined with a leaked `ENCRYPTION_KEY` exposes the agent's private key entirely.

---

## 4. Strategy Rules (Hard — Convention Enforced)

Any function registered in the strategy `REGISTRY` must follow these rules. The TypeScript type system enforces the function signature but not the behavioral contract.

### Rule S1: Spend before work

A strategy must call `balance.spend(agentId, task.cost, metadata)` **before** beginning work. Work must not start if spend fails.

**Why:** If work executes before spend, and then spend fails (e.g., insufficient balance from a race), the agent performs work without a cost record. The economic model breaks.

### Rule S2: Earn or refund after every spend

After a successful spend, the strategy must either:
- Call `balance.earn(agentId, task.revenue, metadata)` on success, **or**
- Call `balance.earn(agentId, task.cost, { type: 'cost_refund', ... })` on infrastructure failure

No strategy may call `spend` and then return without a corresponding earn or refund.

**Why:** An unmatched spend leaves the balance permanently lower without a corresponding transaction. The profit gate will undercount available capital on future iterations.

**Distinction:**
- **Prediction failure** (task executed but failed): absorb the cost. Do not refund. This is the signal the confidence engine uses.
- **Infrastructure failure** (cannot attempt the task): refund the cost. This is not a prediction signal.

### Rule S3: Record every outcome

After every execution (success or failure), the strategy must call `recordOutcome(...)` with accurate fields.

**Why:** Missing outcome records corrupt the confidence engine's signal. Confidence will be computed on incomplete history, producing incorrect decisions.

**Note:** `recordOutcome` is best-effort — it can fail silently. The rule is that it must always be called, not that it must succeed.

### Rule S4: Never bypass the profit gate

A strategy must never be called without first passing through `evaluateProfit()`. The runner enforces this, but strategies must not be invoked directly in any context that bypasses the runner.

### Rule S5: Never mutate balance directly

A strategy must use only `engine/balance.ts` functions (`spend`, `earn`, `resale`). It must not call Supabase directly to modify balance.

---

## 5. Task Source Rules

### Rule T1: Task objects must not include a `confidence` field

The `Task` type has no `confidence` field. Any task source that attempts to inject confidence (e.g., via a custom field in `payload`) must be rejected. Confidence is always computed internally.

### Rule T2: `cost` and `revenue` must be positive integers

All values are in lamports. Fractional values are not valid. Zero cost or zero revenue are not valid.

### Rule T3: `type` must match a registered strategy

A task with `type = "unknown_type"` will be silently skipped by the runner (no spend, no outcome). This is correct behavior but wastes a loop iteration. Task sources should only generate tasks with types registered in the strategy `REGISTRY`.

---

## 6. Operator Rules

### Rule O1: Never modify `balance` directly in the database

Use the API or stored procedures. A direct SQL update bypasses atomicity and breaks the financial ledger.

### Rule O2: Never delete rows from `transactions`

The transaction log is permanent. If a correction is needed, add a compensating transaction (e.g., an earn to reverse an incorrect spend), never delete.

### Rule O3: Never expose or log `encrypted_private_key`

Never copy this field to logs, monitoring systems, dashboards, or API responses. It contains the agent's encrypted private key.

### Rule O4: Never expose the server on a public network without authentication

No auth exists in Phase 1–2. Any caller can create agents, start loops, and consume operator funds. Until auth is implemented, access must be restricted by network controls.

### Rule O5: `ENCRYPTION_KEY` must be stored securely and backed up

Losing the `ENCRYPTION_KEY` means all agent private keys are permanently inaccessible. There is no recovery mechanism. This key must be treated with the same care as the private keys it protects.

---

## 7. Decisions That Are Now Locked

These architectural decisions cannot be changed without a data migration or a breaking protocol change. Treat them as permanent for the current data.

| Decision | Reason Locked | Migration cost if changed |
|---|---|---|
| `BIGINT` lamports for all financial values | Changing to `NUMERIC` or `FLOAT` would require migrating all `agents.balance` and `transactions.amount` columns. Float introduces IEEE 754 rounding errors into the financial ledger — forbidden. | High. Schema migration + data validation. |
| `profit` sign convention (`spend = -amount`, `earn/resale = +amount`) | All historical `SUM(profit)` queries rely on this convention. Changing it invalidates all existing aggregations. | High. Data migration of all existing rows. |
| Transaction schema (`id, agent_id, type, amount, profit, metadata, created_at`) | External tools or queries built on this schema would break on column changes. Existing rows cannot be backfilled with new columns retroactively if required. | Medium to High. |
| `query_hash` scheme for `cache` table | Once cache entries are written, changing the hashing scheme means all existing entries become unreachable (different hash for the same query). All cache is effectively invalidated. | Low (cache is TBD), but must be defined once before first write. |
| `encrypted_private_key` format (`<iv>:<tag>:<ciphertext>`) | Changing the format breaks decryption of all existing keys. All existing encrypted keys would need to be decrypted with the old scheme and re-encrypted with the new one. | Very High. Requires decrypting all agent keys. |

---

## 8. Non-Enforced Invariants (Developer Discipline Required)

These are correct behaviors that the system does not mechanically verify. A developer can accidentally violate them with no immediate error.

| Invariant | Where it should hold | How to detect a violation |
|---|---|---|
| Every strategy must call `recordOutcome()` | All strategy implementations | Confidence diverges from actual success rate; `task_outcomes` has gaps |
| Every `spend` must be paired with `earn` or refund | All strategy implementations | `SUM(profit)` does not match balance; orphaned spends appear in transaction log |
| Infrastructure failures must be refunded; prediction failures must not | `bounty.ts`, `dataResale.ts`, all future strategies | Balance drain from infrastructure errors; confidence corrupted by infrastructure signal |
| `balance.spend/earn/resale` must be used (not Supabase direct) | All modules that affect balance | Balance diverges from transaction log |
| Confidence must not be externally injected | Task source implementations | Execution decisions no longer reflect agent's actual history |
| `encrypted_private_key` must never be logged | All logging statements | Private key exposure risk |

---

## 9. Naming Conventions

Not currently enforced by a linter. Implicit conventions from existing code:

| Element | Convention | Example |
|---|---|---|
| Task type strings | `snake_case` | `"bounty"`, `"data_resale"` |
| Strategy function names | `execute<PascalCaseType>` | `executeBounty`, `executeDataResale` |
| Environment variable names | `UPPER_SNAKE_CASE` | `ENCRYPTION_KEY`, `SUPABASE_URL` |
| DB column names | `snake_case` | `agent_id`, `created_at`, `task_type` |
| TypeScript types | `PascalCase` | `Agent`, `Task`, `ProfitEvaluation` |
| File names | `camelCase.ts` | `runner.ts`, `dataResale.ts` |

These are not enforced. Deviating from them creates inconsistency but not functional errors.

---

## 10. Adding New Components

### Adding a new strategy

1. Implement a function matching `StrategyExecutor = (agentId, task, evaluation) → Promise<Outcome>`
2. Ensure it satisfies Rules S1–S5 (spend before work, earn or refund, record outcome, no gate bypass, no direct balance mutation)
3. Register it in `strategy/registry.ts`: `REGISTRY.set('new_type', executeNewType)`
4. Add corresponding task templates to `tasks/dynamic.ts` for simulation

**No other changes required.** The runner picks up new strategies automatically via `getStrategy(task.type)`.

### Adding a new task type

A new task type requires:
- A strategy registered in `REGISTRY` (see above)
- A template in `DynamicTaskSource` with valid `baseCost`, `baseRevenue`, `ttl_ms`, and `availability`
- `baseCost` and `baseRevenue` must be positive integers (lamports)
- `baseRevenue` should be greater than `baseCost` at full confidence for the task to ever pass the profit gate

No constraints on `payload` schema are currently enforced. Task payloads are passed through to the strategy unchanged.

### Adding a new environment variable

1. Add validation in `config/env.ts` using `required()` for mandatory vars
2. Add the variable to `.env.example` with a description and generation instructions if applicable
3. Ensure the application throws at startup if the variable is missing (fail-fast)

# 04 — Economic Model

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Covers objectives, profit formula, transaction model,
  confidence as economic variable, capital policy, and Phase 1–2 limitations.
```

---

## 1. Core Statement

The system prioritizes cumulative profit while preserving capital, using confidence-adjusted expected value as the sole execution criterion.

This is **bounded profit maximization under a capital constraint** — not risk-neutral throughput maximization. The agent will forgo positive-margin tasks if it cannot afford them, and will never execute tasks with negative expected value regardless of how high the nominal margin appears.

---

## 2. Objectives (Ordered by Priority)

| Priority | Objective | Metric | Description |
|---|---|---|---|
| 1 (Primary) | Maximize cumulative net profit | `SUM(transactions.profit)` | Absolute lamports earned over agent lifetime |
| 2 (Secondary) | Maximize capital efficiency | `total_profit / total_spend` | Profit per lamport risked; used to compare agents and strategies |
| 3 (Constraint) | Preserve capital | `balance > 0` | Agent must maintain a nonzero balance to continue operating |

These three are not equally weighted. The profit gate enforces objective 3 (capital preservation) as a hard constraint — the agent will not spend if it cannot afford the task. Objectives 1 and 2 are pursued within that constraint.

---

## 3. Profit Formula

### Definitions

| Variable | Type | Source | Unit |
|---|---|---|---|
| `task.revenue` | `BIGINT` | Task source (external signal) | lamports |
| `task.cost` | `BIGINT` | Task source (external signal) | lamports |
| `confidence` | `NUMERIC` in `[0.10, 0.95]` | Confidence engine (internal) | dimensionless |
| `expectedRevenue` | `BIGINT` | Computed | lamports |
| `expectedProfit` | `BIGINT` | Computed | lamports |

### Computation

```
expectedRevenue = floor(task.revenue × confidence)
expectedProfit  = expectedRevenue - task.cost
```

### Execution condition

```
execute if and only if: expectedProfit > 0
```

### Why `floor()`

`floor()` applies conservative rounding. Fractional lamports do not exist. Rounding up would overstate expected revenue; `floor()` ensures the agent never executes a task based on a rounding artifact.

### Why confidence is not on `Task`

`task.revenue` and `task.cost` are **external market signals** — the task source sets them. `confidence` is **internal agent state** — derived from the agent's own history of outcomes for that task type. Conflating the two would allow the task source to influence execution probability, breaking the economic guarantee.

---

## 4. Transaction Model

Every financial event produces exactly one row in the `transactions` table. The three transaction types and their economic semantics:

| Type | Trigger | `amount` | `profit` | Balance Effect |
|---|---|---|---|---|
| `spend` | Agent pays to attempt a task | `task.cost` | `-amount` | Decreases |
| `earn` | Agent receives revenue on success, OR cost is refunded on infra failure | `task.revenue` or `task.cost` | `+amount` | Increases |
| `resale` | Agent sells previously computed data to a second party | Sale price | `+amount` | Increases |

### Net economic position

```sql
SELECT SUM(profit) FROM transactions WHERE agent_id = :id;
-- spend rows:  profit = -amount  (outflow)
-- earn rows:   profit = +amount  (inflow)
-- resale rows: profit = +amount  (inflow)
-- Result: net lamports gained or lost since agent creation
```

This is the **authoritative** net position. The `agents.balance` column reflects the same accounting but as a running total (maintained atomically). Both can be used; `SUM(profit)` is the audit-safe version.

### `earn` vs. `resale`: Phase 1–2 distinction

In Phase 1–2, `earn` and `resale` are **mechanically identical** — both increase balance and produce `profit = +amount`. The distinction is semantic:

- `earn`: revenue for direct task execution by this agent
- `resale`: revenue from selling this agent's computed data to another consumer

The separation exists to support future revenue attribution, analytics, and pricing models. No downstream system currently acts on this distinction. Do not treat it as an accounting difference in Phase 1–2.

---

## 5. Capital Constraint

### Affordability gate

Before confidence is computed or the profit gate is evaluated, the agent checks:

```
if task.cost > agent.balance → skip task
```

This is enforced in the runner **before** any DB call or computation. An agent with insufficient balance skips tasks with no side effects — no spend, no outcome record, no confidence update.

### Balance at zero

When `agent.balance = 0` or less than the cost of every available task:

- Agent status remains `'active'` in the database.
- Runner loop continues (with exponential backoff since no tasks execute).
- No tasks are attempted.
- No automatic recovery or top-up occurs.
- The operator must manually fund the agent's balance.

There is **no automatic response** to capital exhaustion. The following are not implemented:

| Policy | Status |
|---|---|
| Minimum balance threshold (stop below X) | ❌ Not implemented |
| Auto-terminate below Y% of initial balance | ❌ Not implemented |
| Loss cap per time window | ❌ Not implemented |
| Balance alerts or notifications | ❌ Not implemented |

Capital risk is currently operator-managed, not system-managed.

---

## 6. Confidence as an Economic Variable

Confidence is not observability metadata. It is the variable that translates raw task revenue into risk-adjusted expected revenue. It belongs to the economic model.

### What confidence represents

For a given `(agentId, taskType)` pair, `confidence` is the agent's empirical estimate of its probability of successfully completing a task of that type, weighted toward recent outcomes.

### How it affects the profit gate

```
Task: cost = 1,000,000 lamports, revenue = 3,000,000 lamports

With confidence = 0.90:
  expectedRevenue = floor(3,000,000 × 0.90) = 2,700,000
  expectedProfit  = 2,700,000 - 1,000,000 = 1,700,000 → EXECUTE

With confidence = 0.30:
  expectedRevenue = floor(3,000,000 × 0.30) = 900,000
  expectedProfit  = 900,000 - 1,000,000 = -100,000 → SKIP

Same task, same market signal. Confidence determines execution.
```

### Confidence floor: economic interpretation

The confidence floor is `0.10`. An agent with a history of 100% failures on a task type will still compute `confidence = 0.10` (not `0.00`). This is intentional:

- **Purpose:** Maintain a minimum exploration probability for every task type. If task economics or execution conditions change, the agent can detect and recover.
- **Cost:** The agent will occasionally execute tasks that its history suggests it will fail on. This absorbs a bounded loss.
- **Not defined:** There is no explicit exploration budget (lamports reserved for this purpose). Loss from floor-driven execution is absorbed from the general balance.

### Confidence ceiling: economic interpretation

The confidence ceiling is `0.95`. An agent with a 100% success rate on a task type will compute `confidence ≈ 0.95` (not `1.00`). This is intentional:

- **Purpose:** Prevent overconfidence. Even a highly reliable task type has a nonzero failure probability. The ceiling reserves a 5% discount on expected revenue as a permanent margin of safety.
- **Effect:** The profit gate is slightly more conservative for highly reliable task types than a naive success-rate model would be.

---

## 7. Failure Modes and Economic Consequences

### Prediction failure

Agent predicted a task would succeed. Task failed during execution (simulated: 10% random rate; Phase 3: real failure conditions).

```
Result:
  spend(cost)           → balance decreases by cost
  work() fails
  → no refund
  earn(0)               → no credit
  net balance impact: -cost
  confidence signal:    failure recorded → confidence decreases
```

This is the primary economic risk. The agent absorbs the full cost of prediction failures. Confidence decreases after each failure, making future executions of the same task type more conservative.

### Infrastructure failure

Agent could not attempt the task due to an infrastructure error (network, timeout, internal exception) — not a task-level failure.

```
Result:
  spend(cost)           → balance decreases by cost
  work() throws
  earn(cost, type='cost_refund') → balance increases by cost
  net balance impact: 0
  confidence signal:    failure recorded in task_outcomes (success=false, actualProfit=0)
```

**Note on confidence signal during infrastructure failures:** Currently, infrastructure failures write a `success=false` outcome to `task_outcomes`. This means infrastructure failures lower the confidence score even though they are not prediction failures. This is a known imprecision. Phase 3 should distinguish these two failure modes at the outcome recording level.

### Balance insufficient (affordability gate)

Agent cannot afford the task.

```
Result:
  no spend
  no execution
  no outcome record
  net balance impact: 0
  confidence signal:  none (task was never attempted)
```

---

## 8. Fees

### Phase 1–2

No fees exist. `task.cost` is a simulated number. No money moves. No on-chain fees, no platform fees.

### Phase 3 design rule

All fees must be incorporated into `task.cost` before the task reaches the profit gate. The profit gate always operates on **true total cost**.

```
task.cost = base_execution_cost + solana_tx_fee + platform_fee
```

This ensures:

- The profit gate evaluates the correct expected profit.
- No fee is invisible to the economic model.
- Strategies do not need to be fee-aware — they see `task.cost` as a complete number.

Fee types anticipated for Phase 3:

| Fee Type | Description | Status |
|---|---|---|
| Solana transaction fee | Per-signature fee for on-chain operations | TBD — depends on Phase 3 on-chain design |
| Platform/coordinator fee | Cut taken by the task coordinator | TBD — not defined |
| Data API access cost | Cost to query the external source that fulfills the task | TBD |

---

## 9. TTL and Time Risk

Every `Task` carries a `ttl_ms` field: the maximum time allowed to complete the task.

### Phase 1–2 behavior (currently inert)

`ttl_ms` is used only to cap the simulated work delay:

```ts
const delay = Math.min(200 + Math.random() * 800, task.ttl_ms - 50);
```

There is no enforcement at the ledger level. If execution takes longer than `ttl_ms`, revenue is still credited. The TTL has **no economic consequence in Phase 1–2**.

### Phase 3 intent

In Phase 3, `ttl_ms` is intended to become an execution deadline enforced by the task coordinator:

```
if execution_time > ttl_ms:
  revenue = 0         (no payment from coordinator)
  cost = already paid (not refunded)
  net: -cost
```

This introduces **time risk** into the economic model. A task with high revenue but a tight TTL is riskier than one with the same revenue and a loose TTL. The current profit gate does not account for this. Phase 3 will require either:

- TTL-adjusted revenue discounting in the profit formula, or
- A separate pre-execution gate that rejects tasks with unreachable TTLs

This is not yet designed.

---

## 10. Multi-Agent Accounting

### Current model

Each agent is economically isolated:

- Separate `agents.balance` (no shared pool)
- Separate `transactions` history (filtered by `agent_id`)
- Separate `task_outcomes` history (filtered by `agent_id`)
- Separate confidence computation (per `agentId × taskType` pair)

One agent's performance does not affect another agent's balance, confidence, or execution decisions.

### Operator aggregation

Aggregate multi-agent accounting is the operator's responsibility. The system provides per-agent data. No portfolio view, combined net position, or cross-agent reporting exists.

```sql
-- Per-agent net position (system provides):
SELECT agent_id, SUM(profit) AS net_profit
FROM transactions
GROUP BY agent_id;

-- Aggregate fleet position (operator computes externally):
SELECT SUM(profit) AS fleet_net_profit FROM transactions;
```

---

## 11. What the Economic Model Does Not Cover (Phase 1–2)

| Gap | Notes |
|---|---|
| Real payment | `task.revenue` is a local number. No lamports transfer. |
| Explicit loss tolerance | Confidence floor provides implicit exploration; no explicit budget. |
| TTL enforcement | TTL has no ledger consequence. |
| Fee model | No fees in any current transaction. |
| Auto capital protection | No min balance, no loss cap, no auto-terminate. |
| Portfolio aggregation | Per-agent only; no fleet-level metrics. |
| Infrastructure vs. prediction failure distinction in outcomes | Both currently write `success=false`. |

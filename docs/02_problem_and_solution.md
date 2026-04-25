# 02 — Problem and Solution

```
Version: v1.0
Last Updated: 2026-04-25
Scope: Phase 1–2 only
Changes:
- Initial draft. Documents the financial correctness problem in autonomous execution systems
  and the solution implemented in Phase 1–2.
```

> **Scope boundary:** This document covers the Phase 1–2 problem only.
> Phase 3 introduces a separate problem (no real task market or external demand exists) that is not covered here.
> Mixing the two produces vague, unactionable documentation.

---

## 1. The Problem

**One sentence:**

> Agents executing tasks without modeling uncertainty and cost as first-class variables will systematically lose money over time.

This is a **financial correctness problem** in autonomous execution systems. It is not:

- A reasoning problem (agents aren't "dumb")
- A marketplace problem (no marketplace is required to observe this failure)
- A framework problem (the gap isn't missing infrastructure — it's missing decision logic)

---

## 2. Who Is Affected

### Primary actor: the operator

The operator is the person or team who:

- Funds the agent's initial balance in lamports
- Bears all financial losses when the agent makes bad decisions
- Relies on the agent's execution decisions being economically correct
- Has no manual intervention mechanism once the agent loop is running

The operator cannot profitably scale manual task selection. That is why the agent exists. If the agent makes systematically bad decisions, the operator has no recourse other than stopping the agent and losing the remaining balance.

### Secondary actors (not primary)

| Actor | Relationship to Problem |
|---|---|
| Developers building on the runtime | Benefit from correctness guarantees, do not directly absorb losses |
| Future task marketplaces | Require reliable agents to fulfill demand, but do not exist yet in Phase 1–2 |

---

## 3. What Exists Today and Why It Fails

### Failure 1: Blind execution (no uncertainty modeling)

Naive execution systems receive a task and execute it unconditionally. They implicitly assume:

```
confidence = 1.0
```

The actual success rate of any non-trivial task type is less than 1.0. An agent that assumes it always succeeds will execute tasks whose real expected value is negative.

**Consequence:** Systematic loss. The agent loses money proportional to its failure rate times its cost per task, regardless of the revenue on success.

### Failure 2: No profit gating

Even systems that track task outcomes often do not gate execution on expected profit. They optimize for:

- Task completion rate
- Reasoning quality (LLM-based agents)
- Throughput

None of these are financial objectives. An agent maximizing throughput will execute every available task, including tasks where `revenue < cost` on a probability-adjusted basis.

**Consequence:** The agent executes tasks with negative expected value. This is not recoverable through volume — it compounds.

### Failure 3: No financial correctness

Systems that lack atomic balance operations allow states such as:

- Task execution begins but balance is not reserved → parallel tasks double-spend
- Task fails mid-execution → cost is debited but never refunded
- Revenue is credited without confirming the cost was debited → balance is inflated

**Consequence:** Accounting corruption. The operator cannot trust the balance field as a reliable indicator of real economic position. Hidden losses accumulate.

### Summary

| Failure Mode | Root Cause | Observable Effect |
|---|---|---|
| Blind execution | `confidence` hardcoded to `1.0` | Agent loses money on every failed task |
| No profit gating | No `expectedProfit > 0` check before execution | Agent takes negative expected-value tasks |
| Non-atomic accounting | Balance updates not coupled to transaction records | Balance is unreliable; losses are hidden |

---

## 4. The Solution

The solution is composed of two mechanisms that must work together. Neither is sufficient alone.

### Core mechanism 1: Profit gate

Before executing any task, the agent evaluates:

```
expectedRevenue = floor(task.revenue × confidence)
expectedProfit  = expectedRevenue - task.cost
```

Execution only proceeds if `expectedProfit > 0`.

This is enforced unconditionally. No strategy can bypass it. The gate is evaluated in `src/engine/profit.ts` and called in `src/agent/runner.ts` before any strategy function is invoked.

### Core mechanism 2: Confidence-adjusted decision

`confidence` is not a static constant and is not provided by the task source. It is computed by the agent from its own historical outcome data for the specific `(agentId, taskType)` pair.

Computation (see `src/engine/confidence.ts`):

```
1. Pull up to 200 recent outcomes for (agentId, taskType) from task_outcomes
2. Weight each outcome: weight = exp(-0.05 × age_hours)
   — outcomes from 14 hours ago have half the weight of a current outcome
3. Apply Laplace smoothing:
   confidence = (weighted_successes + 1.0) / (total_weight + 2.0)
4. Clamp to [0.10, 0.95]
   — agent never fully stops trying (floor) and never fully trusts (ceiling)
```

The result: an agent with a 70% empirical success rate on task type `bounty` computes `confidence ≈ 0.70`, not `1.0`. The profit gate then uses this real number to evaluate expected revenue.

**Why both are required:**

- Profit gate alone with `confidence = 1.0` is no better than blind execution for tasks that sometimes fail.
- Confidence engine alone without a gate produces a number that nothing acts on.

Together they form a decision function that is: deterministic, based on observed data, and financially conservative.

---

## 5. Before and After

### Before: blind execution

```
Variables:
  N = number of tasks executed
  S = actual success rate (e.g. 0.70)
  C = cost per task (lamports)
  R = revenue per task on success (lamports)

Assumed by naive agent: S = 1.0
Decision: execute all tasks

Actual profit = (S × N × R) - (N × C)
             = (0.70 × N × R) - (N × C)

If 0.70 × R < C:
  → profit < 0 for every iteration
  → loss is guaranteed and compounds
```

The agent has no way to detect this condition because it never computes `S`. It simply executes.

### After: confidence-adjusted profit gating

```
Agent computes:
  confidence ≈ S = 0.70  (from task_outcomes history)

For each task:
  expectedRevenue = floor(R × 0.70)
  expectedProfit  = expectedRevenue - C

Agent executes only if expectedProfit > 0.

If floor(R × 0.70) ≤ C:
  → task is skipped
  → no spend, no loss
```

The agent does not execute tasks with negative expected value. Over time, as confidence updates from outcomes, the filter becomes more accurate — not because the model is learning in the ML sense, but because the historical signal is more statistically reliable.

---

## 6. Supporting Mechanisms

These are not the solution. They enforce correctness around the solution.

### Atomic ledger

Every balance operation (spend, earn, resale) is implemented as a Postgres stored function that:
1. Updates `agents.balance`
2. Inserts a row into `transactions`

Both happen in a single implicit transaction. If either fails, both roll back.

This guarantees the operator can always compute the agent's exact economic position as:

```sql
SELECT SUM(profit) FROM transactions WHERE agent_id = :id;
```

Without this, the profit gate makes correct decisions but the accounting cannot be trusted.

### Cost refund on infrastructure failure

If `performWork()` throws an exception (infrastructure failure — not a bad prediction), the agent credits back the spent cost:

```
spend(cost) → work() throws → earn(cost, type='cost_refund')
net change to balance = 0
```

This separates two distinct failure modes:
- **Prediction failure**: agent predicted success, task failed normally → cost is absorbed (this is the signal that lowers confidence)
- **Infrastructure failure**: agent couldn't attempt the task → cost is refunded (this should not affect confidence)

Without this separation, infrastructure errors corrupt the confidence signal.

---

## 7. What This Does Not Solve

This document is scoped to Phase 1–2. The following problems exist but are out of scope here:

| Problem | Why Out of Scope |
|---|---|
| No real tasks exist | Phase 3 problem. Current task source is a simulator. |
| No real revenue is paid | Phase 3 problem. `task.revenue` is a local number, not a real payment. |
| No external demand | Phase 3 problem. No marketplace, no users posting tasks. |
| Agent runner is not persistent | Known Phase 1 infrastructure limitation, documented in `01_overview.md §12`. |
| `paused` state is not implemented | Scoped out of Phase 1–2, no transition logic exists. |

The Phase 1–2 problem — **agents losing money due to incorrect decision logic** — is solved. The next problem class begins in Phase 3.

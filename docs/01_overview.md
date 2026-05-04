# 01 — System Overview

```
Version: v2.0
Last Updated: 2026-04-25
Changes:
- Phase 3 begun. Updated work execution section to reflect real CoinGecko API handlers.
  Updated task source table: HttpTaskSource now active when TASK_SOURCE=http.
  Updated phase state table to reflect current implementation.
  Added coordinator to core loop description.
  Added payment confirmation step to economic guarantees.
```

---

## 1. Identity

The system has no canonical public name and no product tagline.

Internal package identifier: `autofi` (temporary, subject to change, not a brand).

All documentation refers to this system as **"the system"** or **"the agent runtime"**.

Do not use `autofi` as a brand reference in docs, comments, or architecture diagrams.

---

## 2. What Is Being Built

The system is a **deterministic economic execution runtime** for autonomous agents.

Each agent:

1. Receives a list of available tasks from a task source.
2. Evaluates each task using a profit gate (defined in §6).
3. Executes tasks that pass the gate.
4. Records every financial event as an atomic ledger entry.
5. Updates a historical outcome record used to compute future confidence.

The agent does not trade assets, interact with DeFi protocols, execute on-chain strategies, or make decisions based on natural language. It executes discrete units of work that have a defined cost and a defined revenue, and it only does so when the expected return — adjusted for its own historical success rate — is positive.

---

## 3. What Is NOT Being Built

The following are **explicitly out of scope** — not deferred, not implied, not partially implemented:

| Category | Status |
|---|---|
| DEX trading or swap execution | ❌ Not in scope |
| Arbitrage strategies | ❌ Not in scope |
| On-chain strategy execution (any chain) | ❌ Not in scope |
| MEV (maximal extractable value) | ❌ Not in scope |
| Yield optimization | ❌ Not in scope |
| DeFi protocol interaction | ❌ Not in scope |
| General-purpose LLM agent framework | ❌ Not in scope |
| Chatbot or conversational interface | ❌ Not in scope |
| Decentralized marketplace | ❌ Not in current scope |
| On-chain payment contract | ❌ Does not exist yet |

The system is not a financial product. It is an execution runtime that manages the economic loop of acquiring tasks, spending funds to attempt them, and earning revenue on success.

---

## 4. What "Work" Means

Work is defined as: **external data acquisition and/or transformation that has a measurable cost to perform**.

### Current state (Phase 3)

Real work is implemented in `src/work/handlers.ts` and dispatched by `task.type` via `performWork()`.

| Task Type | API | Endpoint | Output |
|---|---|---|---|
| `fetch_sol_usdc_price` | CoinGecko (free) | `/simple/price?ids=solana&vs_currencies=usd` | `{ price: number, symbol: "SOL/USDC" }` |
| `fetch_eth_usdc_price` | CoinGecko (free) | `/simple/price?ids=ethereum&vs_currencies=usd` | `{ price: number, symbol: "ETH/USDC" }` |
| `fetch_btc_dominance` | CoinGecko (free) | `/global` | `{ btc_dominance_pct: number }` |
| `deep_orderbook_analysis` | CoinGecko via Binance tickers (free) | `/coins/solana/tickers?exchange_ids=binance&depth=true` | `{ pair, last_price, spread_pct, volume_24h, cost_to_move_up_usd, cost_to_move_down_usd }` |

Work failures are classified as either `'infrastructure'` (rate limit, network error, server 5xx) or `'prediction'` (bad request, malformed response, wrong params). Infrastructure failures trigger a cost refund. Prediction failures result in cost absorption.

The legacy `performWork()` stub in `strategy/bounty.ts` (simulated delay + random failure) is **retained** for the `bounty` task type, which is used in development with `DynamicTaskSource`.

### Computation resale

`strategy/dataResale.ts` is a stub that always succeeds. Real implementation (caching fetched results and reselling to a second requester) is not yet built.

### Who pays the agent

- **Current:** Payment is simulated. `task.revenue` is a number generated locally by `DynamicTaskSource`. No money moves.
- **Phase 3 (planned):** A central coordinator backend posts tasks and is responsible for paying the agent upon verified completion.
- **Phase 4+ (optional):** Open system where external users or developers post tasks with attached payment. Architecture TBD.

There is currently **no on-chain payment contract and no decentralized payment mechanism**.

---

## 5. Task Source

Tasks are the inputs to the agent loop. The source of tasks changes by phase.

| Phase | Task Source | Mechanism |
|---|---|---|
| 1–2 | `DynamicTaskSource` | Local in-process simulator. Tasks generated from hardcoded templates with random variance and availability probability. No external I/O. Active when `TASK_SOURCE=dynamic`. |
| 3 (current) | `HttpTaskSource` | Polls `GET /external/tasks?agent_id=UUID` from external coordinator. Validates each task, filters expired tasks, deduplicates within a single response. Active when `TASK_SOURCE=http`. |
| 4+ (optional) | Queue-based or on-chain registry | Redis/SQS or on-chain task registry. Not designed yet. |

`DynamicTaskSource` is retained for development. It is not a mock of the real coordinator — it is a self-contained simulator that produces structurally identical tasks.

The current coordinator at `GET /external/tasks` is a **mock** (in-process, at `src/external/coordinator.ts`). In production, set `COORDINATOR_URL` to a real external service.

---

## 6. Core Loop

The agent loop runs as a `while(true)` inside `AgentRunner.start()` until `stop()` is called or `agent.status !== 'active'`.

Each iteration:

```
1. Read agent record from DB          → verify status = 'active', read balance
2. Fetch tasks from task source       → list of Task objects
   [Phase 3: HttpTaskSource calls GET /external/tasks from coordinator]
3. For each task:
   a. Affordability gate              → skip if task.cost > agent.balance
   b. Confidence computation          → computeConfidence(agentId, taskType)
   c. Profit gate                     → evaluateProfit(task, confidence)
   d. If profitable: execute strategy:
        spend()                       → debit cost atomically
        performWork(task)             → call real external API [Phase 3]
        POST /external/tasks/:id/complete → request payment confirmation [Phase 3]
        If confirmed: earn(revenue)   → credit revenue atomically
        If infra failure: earn(cost, cost_refund) → refund cost
        If prediction failure: absorb cost
   e. Record outcome                  → task_outcomes table
4. If 0 tasks executed: exponential backoff (base: 2s, max: 30s)
5. If ≥ 1 task executed: reset backoff, wait pollIntervalMs (2s default)
```

The loop is **fire-and-forget** relative to the HTTP request lifecycle. `POST /agent/:id/run` returns immediately; the loop runs independently in the same Node.js process.

Loop state is held only in memory (`runners: Map<agentId, AgentRunner>`). If the process restarts, all running agents stop. They are not automatically restarted.

---

## 7. Profit Gate (Economic Decision Function)

Every task passes through a single deterministic gate before execution. This gate cannot be bypassed by any strategy.

**Formula:**

```
expectedRevenue = floor(task.revenue × confidence)
expectedProfit  = expectedRevenue - task.cost
```

**Gate condition:**

```
execute if and only if: expectedProfit > 0
```

**Inputs:**

| Variable | Source | Type |
|---|---|---|
| `task.revenue` | Task source (external market signal) | `BIGINT` lamports |
| `task.cost` | Task source (external market signal) | `BIGINT` lamports |
| `confidence` | Confidence engine (internal, computed from history) | `NUMERIC` in `[0.10, 0.95]` |

**Design decisions:**

- `floor()` is intentional: prevents fractional lamport arithmetic, enforces conservative rounding.
- `confidence` is **never** a field on `Task`. It is always computed internally by the agent. The task source cannot inject or override confidence.
- A task with `revenue > cost` can still be rejected if `confidence` is low enough to make `expectedProfit ≤ 0`.

This formula is **final and intentional** for Phase 1–2. It is not a placeholder.

---

## 8. Economic Guarantees

The following guarantees are enforced at the database layer, not the application layer. They cannot be violated by application bugs.

| Guarantee | Mechanism |
|---|---|
| Balance never goes negative | `CHECK (balance >= 0)` + atomic `record_spend` fails if `balance < cost` |
| Spend and earn are atomic | Both operations are Postgres functions that update balance + insert transaction row in a single implicit transaction |
| All financial values are integers | `BIGINT` lamports throughout. No floats anywhere in the financial path. |
| Terminated agents cannot earn | `record_earn` and `record_resale` both check `status != 'terminated'` before crediting |
| Inactive agents cannot spend | `record_spend` checks `status = 'active'` before debiting |

**On infrastructure failure during execution:**

If `performWork()` throws (infrastructure failure, not a prediction failure), the agent refunds the spent cost via `record_earn` with `type: 'cost_refund'`. The agent does not absorb losses from infrastructure errors — only from bad profit predictions.

**Net economic position formula:**

```sql
SELECT SUM(profit) FROM transactions WHERE agent_id = :id;
-- spend rows:  profit = -amount
-- earn rows:   profit = +amount
-- resale rows: profit = +amount
-- SUM = net lamports gained or lost since creation
```

---

## 9. Agent Lifecycle

### States

| State | Meaning | Reachable via API? |
|---|---|---|
| `active` | Loop can run, can spend and earn | `POST /agent/create` (default) |
| `paused` | Defined in schema. Not implemented. | ❌ No route exists |
| `terminated` | Cannot earn. Cannot spend. Final state. | Not exposed via API yet |

`paused` is a schema-level placeholder. No transition logic or API endpoint exists for it in the current codebase.

### Lifecycle events

```
Create  → POST /agent/create      → status: 'active', balance: INITIAL_AGENT_BALANCE
Start   → POST /agent/:id/run     → spawns AgentRunner, adds to runners map
Stop    → POST /agent/:id/stop    → calls runner.stop(), removes from runners map
```

### Multiple concurrent agents

Yes. The `runners: Map<string, AgentRunner>` in `src/routes/agent.ts` supports multiple agents running simultaneously in the same process. There is no hard limit. The practical limit is bounded by process memory and CPU.

### Lifecycle control

Agent lifecycle is **human-controlled via HTTP API**. Agents do not spawn other agents. Agents do not self-terminate based on balance or performance (other than halting task execution when balance is insufficient).

### Balance exhaustion behavior

When `agent.balance < task.cost` for all available tasks:

- The agent does not execute any tasks.
- The agent remains `status: 'active'` in the database.
- The loop continues running (with exponential backoff).
- No automatic recovery, top-up, or termination occurs.

The operator must manually fund the wallet to resume execution. No faucet or auto-funding mechanism exists.

---

## 10. Initial Balance

New agents are created with a configurable starting balance:

```env
INITIAL_AGENT_BALANCE=100000000  # default: 0.1 SOL (in lamports)
```

This balance is set at creation time by the operator. It is not derived from any on-chain deposit or funding contract. It is a number written directly to the `agents.balance` column.

---

## 11. Current Phase State

The codebase implements Phase 1, Phase 2, and Phase 3 (minimum boundary).

| Component | Phase | Status |
|---|---|---|
| Balance engine (`engine/balance.ts`) | Phase 1 | ✅ Complete |
| Profit gate (`engine/profit.ts`) | Phase 1 | ✅ Complete |
| Execution loop (`agent/runner.ts`) | Phase 1 | ✅ Complete |
| Atomic DB functions (`schema.sql`) | Phase 1 | ✅ Complete |
| `task_outcomes` table (`schema_v2.sql`) | Phase 2 | ✅ Complete |
| Confidence engine (`engine/confidence.ts`) | Phase 2 | ✅ Complete |
| Outcome recorder (`outcomes/record.ts`) | Phase 2 | ✅ Complete |
| Real task source (`tasks/http.ts`) | Phase 3 | ✅ Implemented |
| Real work execution (`work/handlers.ts`) | Phase 3 | ✅ Implemented (CoinGecko) |
| Payment confirmation (`external/confirm.ts`) | Phase 3 | ✅ Implemented |
| External coordinator (`external/coordinator.ts`) | Phase 3 | ✅ Implemented (mock) |
| Phase 3 strategy (`strategy/dataFetch.ts`) | Phase 3 | ✅ Implemented |

---

## 12. Infrastructure

| Component | Current | Phase 3+ Target |
|---|---|---|
| Runtime | Single Node.js process | Same (initially) |
| Agent runner state | In-memory `Map<agentId, AgentRunner>` | Redis/BullMQ job queue or worker processes |
| Database | Supabase (managed Postgres) | Supabase (acceptable, not permanent) |
| Deployment target | Local / single server | Single server (initially) |
| Agent runner persistence | None — process restart kills all loops | TBD |

**Known limitation:** In-memory runner state means all running agents stop on process crash or restart. This is a **documented Phase 1 constraint**, not a bug. It is accepted for Phase 1–2 and must be resolved before Phase 3 handles real tasks and real money.

---

## Appendix: Key Files

| File | Purpose |
|---|---|
| `src/agent/runner.ts` | Core agent loop: fetch → gate → execute → record |
| `src/agent/create.ts` | Create and retrieve agent records |
| `src/engine/profit.ts` | Pure profit gate function |
| `src/engine/confidence.ts` | Confidence computation with time-decay and Laplace smoothing |
| `src/engine/balance.ts` | Atomic balance operations (spend, earn, resale) |
| `src/strategy/bounty.ts` | Bounty strategy: spend → work → earn or refund |
| `src/strategy/dataResale.ts` | Data resale strategy (stub — always succeeds) |
| `src/tasks/dynamic.ts` | In-process task simulator |
| `src/routes/agent.ts` | HTTP API for agent lifecycle |
| `schema.sql` | Phase 1 schema: agents, transactions, cache, atomic functions |
| `schema_v2.sql` | Phase 2 schema: task_outcomes table |
| `src/types/index.ts` | All shared TypeScript types |

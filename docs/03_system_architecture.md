# 03 — System Architecture

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Covers component map, stability classification, data flow,
  write consistency model, extension points, and Phase 1 limitations.
```

---

## 1. Design Principle

The architecture separates **economic invariants** from **replaceable execution components**, ensuring flexibility without compromising financial correctness.

Two categories of component exist:

| Category | Meaning |
|---|---|
| **Stable** | Defines a system guarantee. Replacement breaks a core invariant. Do not replace without explicit redesign of the invariant it enforces. |
| **Replaceable** | Extension point. Can be swapped for a different implementation as long as the interface contract and output constraints are preserved. |

---

## 2. Module Map

```
src/
├── index.ts                  Entry point. Wires HTTP server, routes, shutdown.
│
├── config/
│   ├── env.ts                Validates + exports all env vars. Throws at startup if missing.
│   └── supabase.ts           Supabase client singleton.
│
├── routes/
│   ├── agent.ts              HTTP control plane. Holds in-memory runners map (Phase 1 limitation).
│   └── tasks.ts              HTTP task endpoint. Serves tasks to agents using ApiTaskSource.
│
├── agent/
│   ├── create.ts             Agent creation and retrieval (DB read/write).
│   └── runner.ts             Core agent loop: fetch → gate → execute → record.
│
├── engine/
│   ├── profit.ts             [STABLE] Profit gate. Pure function. No I/O.
│   ├── balance.ts            [STABLE] Balance operations. Delegates to Postgres atomic RPCs.
│   └── confidence.ts         [REPLACEABLE] Confidence engine. Time-decay + Laplace smoothing.
│
├── strategy/
│   ├── registry.ts           [REPLACEABLE] Maps task type strings to executor functions.
│   ├── bounty.ts             Bounty strategy implementation.
│   └── dataResale.ts         Data resale strategy (stub — Phase 2).
│
├── tasks/
│   ├── source.ts             TaskSource interface definition.
│   ├── mock.ts               Fixed-cost/revenue task source (unit testing, local dev).
│   ├── dynamic.ts            [REPLACEABLE] Probabilistic task simulator (Phase 1–2 default).
│   └── api.ts                HTTP-backed task source (Phase 3 target).
│
├── outcomes/
│   └── record.ts             Best-effort write to task_outcomes + cache invalidation.
│
├── wallet/
│   └── solana.ts             Generates Solana keypairs at agent creation. Not used in execution.
│
├── crypto/
│   └── keys.ts               AES-256-GCM encrypt/decrypt for agent private keys.
│
└── types/
    └── index.ts              All shared TypeScript types.
```

---

## 3. Stability Classification

### Stable components (do not replace without redesigning the invariant)

#### `engine/profit.ts`

- **Invariant:** No task executes unless `expectedProfit > 0`.
- **Role:** The final authority on execution eligibility. Called by the runner before any strategy.
- **Why stable:** This function enforces the core economic guarantee. Any replacement must preserve the `expectedProfit > 0` gate — a weaker condition breaks the financial correctness claim.
- **Properties:** Pure function. No I/O. No side effects. Deterministic given the same inputs.

```ts
// Signature (never changes):
evaluateProfit(task: Task, confidence: number): ProfitEvaluation
```

#### `engine/balance.ts`

- **Invariant:** Balance updates and transaction ledger entries are always committed together or not at all.
- **Role:** The only permitted path for modifying agent balance. All financial events must go through this module.
- **Why stable:** Bypassing it (e.g., calling Supabase directly from a strategy) breaks atomicity and allows accounting corruption.
- **Properties:** Delegates entirely to Postgres stored procedures (`record_spend`, `record_earn`, `record_resale`). The application layer has no partial-update path.

---

### Replaceable components (swappable within defined constraints)

#### `engine/confidence.ts`

- **Interface:** `computeConfidence(agentId, taskType) → ConfidenceResult`
- **Output constraint:** `confidence ∈ [0.10, 0.95]`. Any replacement must enforce these bounds.
- **Signal constraint:** Must be derived from historical outcome data (or an equivalent signal that reflects actual task success rate). Must not be hardcoded or externally injected by the task source.
- **What is replaceable:** The algorithm (time-decay weighting, Laplace smoothing, lookback window).
- **What is invariant:** The role — confidence is always internally computed by the agent and always passed to the profit gate.
- **Current implementation:** Exponential time-decay (half-life ≈ 14 hours) + Laplace smoothing + in-memory 60-second cache.

#### `TaskSource` (interface in `tasks/source.ts`)

- **Interface:** `fetchTasks(agentId: string) → Promise<Task[]>`
- **Implementations:**

| Implementation | File | Use |
|---|---|---|
| `MockTaskSource` | `tasks/mock.ts` | Fixed tasks, no variability. Unit tests and local dev. |
| `DynamicTaskSource` | `tasks/dynamic.ts` | Probabilistic simulator. Phase 1–2 default in runner. |
| `ApiTaskSource` | `tasks/api.ts` | HTTP pull from external endpoint. Phase 3 target. |

- **Constraint:** Returned `Task` objects must not include a `confidence` field. Confidence is computed internally. The task source is an untrusted external signal.

#### `strategy/registry.ts`

- **Interface:** `StrategyExecutor = (agentId, task, evaluation) → Promise<Outcome>`
- **Adding a strategy:** Implement the function → register it in `REGISTRY` map → done.
- **Constraint:** Every strategy must call `balance.spend()` before work and `balance.earn()` or `balance.resale()` after. Cost refund (`balance.earn` with `type: 'cost_refund'`) is mandatory on infrastructure failure. The outcome must be recorded via `recordOutcome()`.

---

## 4. Core Data Flow

### Per-loop-iteration (inside `AgentRunner.start()`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Agent Loop Iteration                         │
└─────────────────────────────────────────────────────────────────────┘

1. getAgent(agentId)
   → Supabase: SELECT * FROM agents WHERE id = agentId
   → If status ≠ 'active': stop loop
   → Read: agent.balance (lamports)

2. taskSource.fetchTasks(agentId)
   → Phase 1–2: DynamicTaskSource (local, no I/O)
   → Phase 3:   GET /tasks?agentId=... (external HTTP)
   → Returns: Task[]

3. For each Task:

   a. Affordability gate
      if task.cost > agent.balance → SKIP (log, continue)

   b. computeConfidence(agentId, task.type)
      → Check in-memory CACHE (60s TTL)
      → If miss: SELECT success, created_at FROM task_outcomes
                 Apply time-decay weights
                 Apply Laplace smoothing
                 Clamp to [0.10, 0.95]
      → Returns: { confidence, sampleSize, source }

   c. evaluateProfit(task, confidence)
      → expectedRevenue = floor(task.revenue × confidence)
      → expectedProfit  = expectedRevenue - task.cost
      → If expectedProfit ≤ 0 → SKIP (log, continue)

   d. getStrategy(task.type)
      → REGISTRY.get(task.type)
      → If not found → SKIP

   e. strategy(agentId, task, evaluation)
      → balance.spend(agentId, task.cost, metadata)
         → Postgres: record_spend RPC (atomic)
      → performWork(task)
         → [Phase 1–2: simulated delay + 10% failure rate]
         → [Phase 3: real data acquisition]
      → On success:
         balance.earn(agentId, task.revenue, metadata)
         → Postgres: record_earn RPC (atomic)
      → On infrastructure failure:
         balance.earn(agentId, task.cost, { type: 'cost_refund' })
         → Postgres: record_earn RPC (atomic)

   f. recordOutcome(...)
      → Supabase: INSERT INTO task_outcomes (best-effort, can fail silently)
      → invalidateCache(agentId, task.type)

4. Backoff
   → If executed = 0: sleep(backoff); backoff = min(backoff × 1.5, 30_000)
   → If executed ≥ 1: sleep(2_000); backoff = 2_000
```

---

## 5. Write Consistency Model

The system has two write tiers. This separation is **intentional and permanent**.

### Tier 1: Financial writes (strict)

| Property | Value |
|---|---|
| Tables | `agents` (balance), `transactions` |
| Mechanism | Postgres stored procedures (`record_spend`, `record_earn`, `record_resale`) |
| Atomicity | Balance update + transaction row committed together. Either both succeed or neither does. |
| Failure behavior | Throws `BalanceError`. Strategy receives the error. Runner logs it. No silent failure. |
| Application bypass | Not permitted. `engine/balance.ts` is the only valid write path. |

Invariant: **financial state is always consistent**. `SUM(transactions.profit) WHERE agent_id = X` always equals the real net economic position of agent X.

### Tier 2: Analytics writes (best-effort)

| Property | Value |
|---|---|
| Tables | `task_outcomes` |
| Mechanism | Supabase client `insert` (standard async call) |
| Atomicity | Not atomic with financial writes. Deliberately separate. |
| Failure behavior | `console.warn` and return. The agent continues normally. |
| Effect of failure | Agent loses one data point for confidence computation. No financial impact. |

Invariant: **analytics failures must never impact financial state**. A failed `task_outcomes` insert is never a reason to refund, retry, or alter balance.

```
Financial write fails → throws → loop handles it
Analytics write fails → logs warning → loop continues
```

---

## 6. Component Dependency Graph

```
index.ts
  └── routes/agent.ts
        └── agent/runner.ts
              ├── engine/profit.ts          (no deps)
              ├── engine/confidence.ts      → config/supabase.ts
              ├── engine/balance.ts         → config/supabase.ts
              ├── strategy/registry.ts
              │     ├── strategy/bounty.ts
              │     │     ├── engine/balance.ts
              │     │     └── outcomes/record.ts → config/supabase.ts
              │     │                          → engine/confidence.ts (cache invalidation)
              │     └── strategy/dataResale.ts  (same deps as bounty.ts)
              ├── tasks/dynamic.ts          (no external deps)
              └── agent/create.ts           → config/supabase.ts
                                            → wallet/solana.ts
                                            → crypto/keys.ts
                                            → config/env.ts
```

**Key observations:**

- `engine/profit.ts` has zero dependencies. It is the most stable module in the system.
- `engine/balance.ts` depends only on `config/supabase.ts`. If the DB layer changes, only this module changes.
- `outcomes/record.ts` calls `invalidateCache` from `engine/confidence.ts`. This is the only cross-engine coupling.

---

## 7. HTTP API (Control Plane)

The HTTP layer is the permanent operator control plane. It is not temporary, but it will expand.

| Route | Method | Action |
|---|---|---|
| `/health` | GET | Liveness check. Returns `{ status, ts }`. |
| `/agent/create` | POST | Create agent. Generates Solana keypair, encrypts private key, writes to DB. |
| `/agent/:id` | GET | Fetch agent record (encrypted private key is stripped before response). |
| `/agent/:id/transactions` | GET | Fetch transaction history. Max 200 rows. Default 50. |
| `/agent/:id/run` | POST | Start agent loop. Adds `AgentRunner` to in-memory `runners` map. Fire-and-forget. |
| `/agent/:id/stop` | POST | Stop agent loop. Calls `runner.stop()`, removes from `runners` map. |
| `/agent` | GET | List all currently running agent IDs (from in-memory map). |

**Note on `/agent` (list running):** This reflects in-memory state only. An agent with `status = 'active'` in the DB is not necessarily running — it may not have been started, or may have been running in a previous process instance.

---

## 8. Wallet and Crypto Layer

### Current role (Phase 1–2)

| Component | Used For | Not Used For |
|---|---|---|
| `wallet/solana.ts` | Generating a unique Base58 public key at agent creation | Any on-chain action |
| `crypto/keys.ts` → `encryptKey` | Storing the private key AES-256-GCM encrypted in DB | — |
| `crypto/keys.ts` → `decryptKey` | — | Not called anywhere in current runtime |

The Solana wallet exists as a future-facing identity layer. In Phase 1–2:

- `agents.wallet` (Base58 public key) is stored in DB as a unique identifier.
- `agents.encrypted_private_key` is stored encrypted and **never decrypted** during normal operation.
- All agent balances are Postgres `BIGINT` values (lamports). No SOL is held or transferred on-chain.

**Explicitly:** the `@solana/web3.js` package is used only to generate a keypair. No RPC calls, no transactions, no account reads are made against any Solana network.

### Phase 3 role (planned)

`decryptKey` will be used when the agent must sign a Solana transaction — e.g., to receive on-chain payment or prove identity to an external coordinator. The private key will be decrypted in-process, used to sign, and immediately discarded. It will not be logged, serialized, or stored in plaintext.

### Encryption spec

```
Algorithm:  AES-256-GCM
Key length: 256-bit (32 bytes, from ENCRYPTION_KEY env var as 64 hex chars)
IV:         96-bit, randomly generated per encryption (never reused)
Auth tag:   128-bit, stored with ciphertext for tamper detection
Format:     <iv_b64url>:<authTag_b64url>:<ciphertext_b64url>
```

---

## 9. Phase 1 Architectural Limitations

These are documented constraints, not bugs. They are accepted for Phase 1–2 and must be resolved before Phase 3 handles real tasks and real money.

| Limitation | Location | Impact | Phase 3 Resolution |
|---|---|---|---|
| In-memory `runners` map | `routes/agent.ts` | Process restart stops all agents. No persistence. Cannot scale horizontally. | Move to Redis/BullMQ job queue or dedicated runner service. |
| In-memory confidence cache | `engine/confidence.ts` | Cache is per-process. Multiple processes compute independent caches. Cache is lost on restart. | Externalize to Redis or shared store. |
| Stateful HTTP layer | `routes/agent.ts` | The HTTP route module holds runtime state (`runners`). Violates separation of concerns. | Extract to a `services/runner-registry.ts` module. |
| `cache` table unused | `schema.sql` | Defined for Phase 3 computation reuse. No reads or writes in current runtime. | Phase 3: back the data reuse / memoization layer. |
| `decryptKey` unused | `crypto/keys.ts` | Private key decryption path exists but is never exercised. | Phase 3: activated for Solana transaction signing. |
| `paused` status unreachable | `schema.sql`, `types/index.ts` | State is defined but no API route transitions to it. | Implement `/agent/:id/pause` and resume logic when needed. |
| No authentication on API | `routes/agent.ts` | Any process with network access to the server can create, start, or stop agents. | Add auth layer before any public-facing deployment. |

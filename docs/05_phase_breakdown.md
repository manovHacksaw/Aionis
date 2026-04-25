# 05 — Phase Breakdown

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Documents phases 1–3 with testable completion criteria,
  inter-phase rules, known unknowns, and what changed at each boundary.
```

---

## 1. Core Rule

Each phase extends the system's capabilities without relaxing the economic correctness guarantees established in Phase 1.

This is not aspirational — it is a hard constraint. If a Phase 3 change requires weakening the profit gate, compromising atomicity, or bypassing any Phase 1 invariant, the change is rejected or redesigned. Phase advancement is **additive**, never reductive.

---

## 2. Phase Map

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | ✅ Complete | Deterministic execution, financial correctness, profit gating |
| Phase 2 | ✅ Complete | Adaptive decision-making via confidence derived from historical outcomes |
| Phase 3 | ❌ Not started | Real-world integration: external task source, real work, real economic flow |
| Phase 4+ | — | Conceptual placeholder only. Not scoped. Not documented beyond this row. |

---

## 3. Phase 1 — Economic Correctness Foundation

### Definition

Deterministic execution with correct accounting and profit gating. The system executes tasks only when profitable and maintains a consistent financial ledger under all execution sequences.

### Status: Complete

### Completion criteria (all must be true)

**1. Agent lifecycle is operational**

```
POST /agent/create       → agent row created, balance = INITIAL_AGENT_BALANCE
POST /agent/:id/run      → runner loop starts, agent appears in runners map
POST /agent/:id/stop     → runner stops, agent removed from runners map
GET  /agent/:id          → returns agent record (no encrypted_private_key)
```

**2. Profit gate is enforced without exception**

For any task where `floor(revenue × confidence) - cost ≤ 0`:
- `balance.spend()` is never called
- No entry is added to `transactions`
- No strategy function executes

Verification: inject a task where `cost > revenue` (e.g., `cost = 500_000`, `revenue = 400_000`, any confidence). Confirm `spend()` is not called.

**3. Balance correctness holds for any execution sequence**

```
balance_final = balance_initial + Σ(earn amounts) + Σ(resale amounts) - Σ(spend amounts)
```

This identity must hold after any number of spend/earn/resale operations in any order.

**4. Balance never goes negative**

Attempting `spend(amount)` where `amount > balance` must:
- Return `{ success: false, error: 'insufficient_balance_or_agent_inactive' }` from the Postgres RPC
- Throw `BalanceError` in the application layer
- Leave `agents.balance` unchanged
- Not insert a `transactions` row

**5. Every financial event is recorded atomically**

For every call to `balance.spend()`, `balance.earn()`, or `balance.resale()`:
- Exactly one row is inserted into `transactions`
- Balance update and row insertion commit together (both succeed or both roll back)
- No financial event produces zero rows

### Phase 1 failure conditions

Phase 1 is NOT complete if any of the following can occur:

- The profit gate is bypassed (any strategy executes with `expectedProfit ≤ 0`)
- Balance after a sequence of operations does not match the expected formula
- A spend succeeds without a corresponding `transactions` row
- Balance goes below zero under any condition

---

## 4. Phase 2 — Adaptive Decision Layer

### Definition

Execution decisions incorporate the agent's own historical success rate, per task type. Confidence is derived from recorded outcomes, not hardcoded. Behavior changes as history accumulates.

### Status: Complete

### What changed from Phase 1

| Change | Type | Detail |
|---|---|---|
| `confidence` removed from `Task` | **Breaking (conceptual)** | Previously, confidence could be externally provided via the task. Phase 2 moves it to an internal engine. The task source can no longer influence execution probability. |
| `task_outcomes` table added | **Additive** | `schema_v2.sql`. Not atomic with financial writes (deliberate). |
| Confidence engine added | **Additive** | `engine/confidence.ts`. Time-decay + Laplace smoothing. In-memory 60s cache. |
| Outcome recorder added | **Additive** | `outcomes/record.ts`. Best-effort write + cache invalidation after every execution. |

No Phase 1 schema, types, or invariants were altered. The balance engine, profit formula, and transaction schema are unchanged.

### Completion criteria (all must be true)

**1. Confidence is derived from history, not hardcoded**

`computeConfidence(agentId, taskType)` must read from `task_outcomes`. With zero history: returns `0.50` (neutral prior, `source: 'default'`). With history: returns a computed value based on weighted success rate.

**2. Outcomes influence future decisions**

Test: force repeated `success=false` outcomes for task type X (e.g., run a task that always fails). Observe that `confidence(agentId, X)` decreases over successive calls.

**3. Behavior changes as confidence changes**

A task with `cost = C` and `revenue = R` where `floor(R × 0.90) - C > 0` but `floor(R × 0.30) - C ≤ 0` must:
- Execute when `confidence ≥ 0.90`
- Be skipped when `confidence ≤ 0.30`

**4. Outcome logging writes persist**

Every task execution (success or failure) must produce an entry in `task_outcomes` with correct fields: `agent_id`, `task_type`, `task_id`, `success`, `cost`, `revenue`, `actual_profit`, `expected_profit`, `confidence_used`.

**5. All Phase 1 invariants remain intact**

Confidence integration must not affect:
- Balance correctness
- Profit gate enforcement
- Atomic transaction recording
- Balance floor (`≥ 0`)

### Phase 2 failure conditions

Phase 2 is NOT complete if any of the following:

- `confidence` value does not change after accumulated outcomes
- Agent behavior is identical to Phase 1 (fixed confidence = 1.0 equivalent)
- Outcomes are not persisted to `task_outcomes`
- Any Phase 1 invariant is violated

---

## 5. Phase 3 — Real-World Integration

### Definition

The agent operates in a real environment: fetching tasks from an external system, executing real work, and participating in a real economic flow where revenue reflects actual external payment or commitment.

### Status: Not started

### Minimum Phase 3 boundary

Phase 3 begins when **all four** of the following are true:

| Condition | Description |
|---|---|
| Real task source | Agent fetches tasks from an external system via HTTP (`ApiTaskSource`). `DynamicTaskSource` is not used in production. |
| Real work execution | `performWork()` stub is replaced with logic that performs actual data acquisition or processing. |
| Real economic flow | `task.revenue` reflects an actual payment commitment from an external actor (on-chain payment not required at minimum). Off-chain payment or signed commitment is sufficient. |
| External actor | At least one entity outside the system submits tasks and initiates payment. |

### What is NOT required for minimum Phase 3

- ❌ On-chain payments or Solana transaction settlement
- ❌ Decentralized marketplace
- ❌ Multiple independent task providers
- ❌ Trustless task validation
- ❌ Smart contract escrow
- ❌ `paused` state implementation
- ❌ Distributed agent runners

These belong to full Phase 3 or Phase 4+.

### Phase 3 known unknowns (undesigned as of Phase 2 completion)

The following are explicitly unresolved. They must be designed before Phase 3 can be built:

| Unknown | Question |
|---|---|
| Task API contract | What does `GET /tasks` return? What fields? Auth scheme? Pagination? Rate limits? |
| Payment mechanism | Who sends lamports to the agent wallet? When? Before or after work? How is completion verified? |
| Payment timing | Prepaid (escrow), postpaid (on completion), or hybrid? |
| `performWork()` implementation | What does real work look like per task type? Which external APIs are called? |
| TTL enforcement | Does the coordinator reject payment if `execution_time > ttl_ms`? Who enforces it? |
| Fee model | What fees exist? How are they incorporated into `task.cost`? |
| Result verification | How does the requester verify that the agent's output is correct before paying? |
| Failure attribution | If a task fails, who absorbs the cost — agent or requester? Under what conditions? |
| Task posting identity | Who is allowed to post tasks? Any caller? Authenticated clients only? |
| Confidence cache externalization | In-memory cache is not viable for multiple processes. Redis or equivalent required. |

None of these are implementation details — they are protocol and economic design questions. Answering them is prerequisite to Phase 3 engineering.

### Phase 3 Phase 1–2 invariants that must be preserved

All Phase 1 and Phase 2 guarantees carry forward:

- Profit gate: no execution without `expectedProfit > 0`
- Balance atomicity: no partial financial state
- Balance floor: `balance ≥ 0`
- Confidence must remain internally computed (real task source must not include a confidence field)
- Two-tier write model: financial writes atomic, analytics writes best-effort

---

## 6. Inter-Phase Rules

### Invariant preservation

Every phase must preserve all invariants from all previous phases. There is no "we'll fix the accounting later" — correctness is non-negotiable across phase boundaries.

### Sequencing

Phases are not required to be strictly sequential for all work. Specifically:

- Phase 3 integration work (e.g., building the real task API, designing the payment protocol) can begin before all Phase 2 hardening items are complete (e.g., before `paused` state is implemented).
- **Exception:** Phase 3 work that touches the economic core (profit gate, balance engine, transaction schema) must not begin until the relevant Phase 1–2 invariant is stable and tested.

### Phase advancement gate

Before declaring a phase complete and beginning the next:

1. All completion criteria for the current phase must be verifiably true.
2. All Phase 1 invariants must still hold.
3. No known regression from prior phases.

Phase advancement is a decision, not just a code state.

---

## 7. Component Status by Phase

| Component | Phase Introduced | Phase 1–2 Status | Phase 3 Action |
|---|---|---|---|
| `engine/profit.ts` | Phase 1 | ✅ Stable | No change required |
| `engine/balance.ts` | Phase 1 | ✅ Stable | No change required |
| `schema.sql` (agents, transactions) | Phase 1 | ✅ Stable | No change required |
| `agent/runner.ts` | Phase 1 | ✅ Stable | May need TTL enforcement logic |
| `agent/create.ts` | Phase 1 | ✅ Stable | No change required |
| `routes/agent.ts` (runners map) | Phase 1 | ⚠️ Known limitation | Move to external job queue |
| `tasks/dynamic.ts` | Phase 1 | ✅ Dev simulator | Replaced by `ApiTaskSource` in production |
| `schema_v2.sql` (task_outcomes) | Phase 2 | ✅ Stable | No change required |
| `engine/confidence.ts` | Phase 2 | ✅ Stable (limited) | Cache must be externalized |
| `outcomes/record.ts` | Phase 2 | ✅ Stable | No change required |
| `strategy/bounty.ts` (performWork stub) | Phase 1–2 | ⚠️ Simulated | Replaced with real implementation |
| `strategy/dataResale.ts` | Phase 2 | ⚠️ Stub | Replaced with real implementation |
| `tasks/api.ts` (ApiTaskSource) | Phase 2 (prep) | ✅ Built, unused in prod | Activated as default task source |
| `wallet/solana.ts` | Phase 1 | ⚠️ Unused in execution | Activated for transaction signing |
| `crypto/keys.ts` (decryptKey) | Phase 1 | ⚠️ Unused | Activated for signing |
| `cache` table | Phase 1 (reserved) | ⚠️ Defined, unused | Phase 3: data reuse layer |

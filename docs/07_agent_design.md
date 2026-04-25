# 07 — Agent Design

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial draft. Covers agent definition, state machine, identity model,
  runner lifecycle, isolation guarantees, and Phase 1 limitations.
```

---

## 1. What Is an Agent

An agent is a **persistent identity** (database row) paired with an **optional runtime execution instance** (AgentRunner loop).

| Layer | Location | Lifecycle |
|---|---|---|
| Persistent identity | `agents` table in Postgres | Exists until explicitly terminated. Survives process restarts. |
| Runtime instance | `AgentRunner` in `runners` map (in-memory) | Exists only while the process is running and the agent has been started via API. Lost on process restart. |

These two layers are currently **decoupled**: a row with `status = 'active'` does not imply a loop is running. A loop running does not write back to the DB to indicate its running state. This is a **Phase 1 limitation**, not the intended long-term design.

---

## 2. Agent State Machine

### States

| State | Meaning | Reachable? |
|---|---|---|
| `active` | Agent can run, spend, and earn. Loop may or may not be running. | Yes — default at creation |
| `paused` | Agent cannot run. Loop will not start. Spend and earn are blocked. | No — no API route exists in Phase 1–2 |
| `terminated` | Agent cannot earn or spend. Cannot be reactivated. Final state. | No API route yet, but `record_earn` and `record_spend` enforce this at DB level |

### Intended transitions

```
              ┌──────────────────────────────────┐
              │                                  │
         [create]                          [operator: resume]
              │                                  │
              ▼                                  │
           active ──[operator: pause]──► paused ─┘
              │                           │
              │                           │
     [operator or system]        [operator decision]
              │                           │
              └────────────► terminated ◄─┘
                              (irreversible)
```

| Transition | Trigger | Implemented? |
|---|---|---|
| `→ active` | `POST /agent/create` | ✅ Yes |
| `active → paused` | Future `POST /agent/:id/pause` | ❌ No route |
| `paused → active` | Future `POST /agent/:id/resume` | ❌ No route |
| `active → terminated` | Future operator action or system failure condition | ❌ No route |
| `paused → terminated` | Future operator decision | ❌ No route |

### Why `terminated` is irreversible

A terminated agent represents a closed economic entity. Reactivating it would:
- Reopen a balance that may have been reconciled
- Risk reuse of a potentially compromised or corrupted agent identity
- Create ambiguity in transaction history (was this agent the same entity before and after?)

Termination is permanent by design.

### DB enforcement of state

State constraints are enforced at the Postgres level, not the application level:

| Operation | State required | Enforcement |
|---|---|---|
| `record_spend` | `status = 'active'` | Postgres function checks before UPDATE |
| `record_earn` | `status != 'terminated'` | Postgres function checks before UPDATE |
| `record_resale` | `status != 'terminated'` | Postgres function checks before UPDATE |

A `paused` agent cannot spend (spend requires `active`). It can still receive an earn — this is intentional to allow cost refunds if an infra failure occurs mid-execution after the loop is stopped.

---

## 3. Runtime Lifecycle

### Start sequence

```
POST /agent/:id/run
  → validate agent exists (getAgent)
  → check: agent not already in runners map (409 if yes)
  → create AgentRunner(agentId)
  → runners.set(agentId, runner)
  → runner.start()  ← fire-and-forget
  → return 200 { message: 'Agent started', agentId }
```

`runner.start()` is called without `await`. The HTTP response returns immediately. The loop runs independently of the request lifecycle.

### Stop sequence

```
POST /agent/:id/stop
  → get runner from runners map (404 if missing)
  → runner.stop()   ← sets this.running = false
  → runners.delete(agentId)
  → return 200 { message: 'Agent stopped', agentId }
```

`runner.stop()` sets a flag. The loop checks this flag at the top of each iteration and exits cleanly after the current task completes (or the current sleep ends). It is not an immediate interrupt.

### Crash behavior

If `runner.start()` throws an unhandled error:
- The runner is removed from the `runners` map via the `.catch()` handler
- The error is logged to `console.error`
- The agent's DB state is **not changed** — it remains `status = 'active'`
- The loop does not restart automatically

The agent appears running in the DB but is not running in the process. The operator must restart it manually via `POST /agent/:id/run`.

---

## 4. Agent Identity

| Identifier | Type | Role |
|---|---|---|
| `id` (UUID) | Internal canonical ID | Used for all internal operations, DB joins, and API routes |
| `wallet` (Base58) | Solana public key | Unique per agent; future external identity in Phase 3 |

**UUID is the canonical ID.** All internal systems reference agents by UUID.

**Wallet is an attribute.** In Phase 1–2, the wallet is stored and kept unique, but never used in execution or accounting. In Phase 3, the wallet will become the external identity — how other systems (coordinators, on-chain programs) identify this agent.

The wallet address is never exposed in a context where it could be used to derive the private key. The encrypted private key is stripped before API responses (see `routes/agent.ts`).

---

## 5. Agent Differentiation

All agents run the same code. The differences between agents are entirely data-level:

| Field | Meaning | Currently |
|---|---|---|
| `id` | Unique identity | UUID, generated at creation |
| `wallet` | Unique Solana address | Generated at creation, unused in execution |
| `balance` | Capital available to spend | Set at creation, changes with every execution |
| `strategy` | Strategy type the agent runs | Currently always `'bounty'` |
| `status` | Lifecycle state | `'active'` at creation |
| Historical outcomes | Per `(agent_id, task_type)` in `task_outcomes` | Accumulated over time; drives confidence |

### The `strategy` field

`strategy` is currently a placeholder for future extensibility. Its current behavior:

- Only `'bounty'` is accepted at creation (enforced in `routes/agent.ts`)
- It does **not** constrain which task types the agent attempts — that is determined by the strategy `REGISTRY`
- An agent with `strategy = 'bounty'` will still attempt `data_resale` tasks if they appear and pass the profit gate, because `data_resale` is registered in the strategy registry independently

**Future intent:** `strategy` will be used to route agents toward specific task types or execution modes. An agent created with `strategy = 'data_resale'` might only be assigned data resale tasks. This design is not implemented.

---

## 6. Agent Isolation

Each agent is fully isolated from every other agent:

| Resource | Isolated? |
|---|---|
| Balance | ✅ Yes — per-agent `BIGINT` column, no shared pool |
| Transaction history | ✅ Yes — all queries filter by `agent_id` |
| Outcome history | ✅ Yes — all queries filter by `agent_id` |
| Confidence cache | ✅ Yes — cache key is `agentId:taskType` |
| Runner loop | ✅ Yes — separate `AgentRunner` instance per agent |
| Wallet / private key | ✅ Yes — unique keypair per agent |

No agent's execution, failure, or balance affects any other agent's behavior. There is no shared balance pool, no cross-agent confidence signal, and no mechanism for agents to communicate.

---

## 7. Running vs. Not-Running: Phase 1 Limitation

The DB field `status = 'active'` means the agent is eligible to run. It does not mean the loop is currently executing.

The `runners` map in `routes/agent.ts` holds the ground truth for which agents are currently running — but this map is **in-memory and process-local**.

Consequences:

| Scenario | Result |
|---|---|
| Process restarts | All runners are lost. Agents remain `active` in DB but no loop runs. |
| Multiple process instances | Each process has its own `runners` map. No coordination. Same agent could theoretically be started in two processes simultaneously. |
| `GET /agent` (list running) | Returns agents in current process's `runners` map only. Not a global state. |

**Intended Phase 3 resolution:** externalize runner state to a job queue (Redis/BullMQ) or dedicated runner service. The DB would gain a reliable `is_running` field or equivalent.

---

## 8. Agent Creation Flow

```
POST /agent/create  { strategy: "bounty" }

1. generateWallet()
   → Keypair.generate() via @solana/web3.js
   → publicKey (Base58), secretKey (base64, 64 bytes)

2. encryptKey(secretKeyBase64)
   → AES-256-GCM with master key from ENCRYPTION_KEY env var
   → produces: <iv>:<tag>:<ciphertext> (base64url)

3. supabase.from('agents').insert({
     wallet:                publicKey,
     encrypted_private_key: encryptedKey,
     balance:               env.initialBalance,   // from INITIAL_AGENT_BALANCE
     strategy:              'bounty',
     status:                'active',
   })

4. Return { agentId: uuid, wallet: publicKey }
```

The private key is encrypted before it leaves the `create.ts` module. It is never stored in plaintext. It is never returned by any API endpoint. The API returns only `agentId` and `wallet`.

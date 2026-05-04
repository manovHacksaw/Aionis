# 09 — API Design

```
Version: v2.0
Last Updated: 2026-04-25
Changes:
- Phase 3: added GET /external/tasks and POST /external/tasks/:id/complete (coordinator API).
  Updated idempotency table. Updated Phase 3 API changes section.
```

---

## 1. Overview

The HTTP API is the **permanent operator control plane**. It is not a temporary interface. It will expand in Phase 3 (auth, additional endpoints, structured errors) but the existing routes are stable.

**Base:** `http://localhost:{PORT}` (default PORT = 3000)

**Request format:** JSON body (`Content-Type: application/json`)

**Response format:** JSON

**Auth:** None in Phase 1–2. Required before Phase 3 deployment.

**Versioning:** No version prefix currently (`/agent/...` not `/v1/agent/...`). Versioning is planned before Phase 3.

---

## 2. Endpoints

### `GET /health`

Liveness check.

**Request:** No body, no params.

**Response 200:**
```json
{
  "status": "ok",
  "ts": "2026-04-25T12:00:00.000Z"
}
```

**Notes:** `ts` is the current server timestamp in ISO 8601. This endpoint never returns a non-200 if the process is running.

---

### `POST /agent/create`

Create a new agent.

**Request body:**
```json
{
  "strategy": "bounty"
}
```

| Field | Type | Required | Valid values | Default |
|---|---|---|---|---|
| `strategy` | `string` | No | `"bounty"` | `"bounty"` |

**Response 201:**
```json
{
  "agentId": "550e8400-e29b-41d4-a716-446655440000",
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

**Response 400:**
```json
{ "error": "Unknown strategy: <value>" }
```

**Response 500:**
```json
{ "error": "<error message>" }
```

**Idempotency:** NOT idempotent. Each call creates a new agent with a new UUID and a new Solana keypair. Calling twice creates two independent agents.

**Side effects:**
- Generates a new Solana keypair
- Encrypts the private key (AES-256-GCM)
- Inserts row into `agents` with `status = 'active'` and `balance = INITIAL_AGENT_BALANCE`

---

### `GET /agent/:id`

Fetch agent record.

**Path params:**
- `id`: UUID of the agent

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "balance": 100000000,
  "strategy": "bounty",
  "status": "active",
  "created_at": "2026-04-25T12:00:00.000Z"
}
```

**Note:** `encrypted_private_key` is stripped from the response before serialization. It is never returned.

**Response 404:**
```json
{ "error": "Agent not found: <supabase message>" }
```

---

### `GET /agent/:id/transactions`

Fetch transaction history for an agent.

**Path params:**
- `id`: UUID of the agent

**Query params:**

| Param | Type | Default | Max |
|---|---|---|---|
| `limit` | integer | `50` | `200` |

**Response 200:**
```json
[
  {
    "id": "uuid",
    "agent_id": "uuid",
    "type": "earn",
    "amount": 3000000,
    "profit": 3000000,
    "metadata": { "taskId": "...", "taskType": "bounty" },
    "created_at": "2026-04-25T12:00:01.000Z"
  },
  {
    "id": "uuid",
    "agent_id": "uuid",
    "type": "spend",
    "amount": 1000000,
    "profit": -1000000,
    "metadata": { "taskId": "...", "expectedProfit": 1800000 },
    "created_at": "2026-04-25T12:00:00.000Z"
  }
]
```

Results are ordered by `created_at DESC` (most recent first). Empty array if no transactions exist.

**Response 500:**
```json
{ "error": "<error message>" }
```

---

### `POST /agent/:id/run`

Start the autonomous loop for an agent.

**Path params:**
- `id`: UUID of the agent

**Request body:** None.

**Response 200:**
```json
{ "message": "Agent started", "agentId": "uuid" }
```

**Response 400:**
```json
{ "error": "Missing agent id" }
```

**Response 404:**
```json
{ "error": "Agent not found: <message>" }
```

**Response 409:**
```json
{ "error": "Agent is already running" }
```

**Idempotency:** Partially idempotent. Calling `/run` when the agent is already running returns 409 — it does not start a second loop. Calling `/stop` then `/run` starts a fresh loop.

**Behavior:** Fire-and-forget. The loop starts in the background. The HTTP response returns before the first loop iteration completes. The loop runs until `stop()` is called, the agent's status becomes non-active, or an unrecoverable error crashes the runner.

---

### `POST /agent/:id/stop`

Stop the autonomous loop for an agent.

**Path params:**
- `id`: UUID of the agent

**Request body:** None.

**Response 200:**
```json
{ "message": "Agent stopped", "agentId": "uuid" }
```

**Response 404:**
```json
{ "error": "No running agent with that id" }
```

**Behavior:** Sets the runner's internal `running = false` flag. The loop exits at the next iteration boundary (after the current task or sleep completes). Not an immediate kill.

**Note:** This stops the runtime loop only. The agent's DB `status` remains `'active'`. To also change the status, a separate operation would be required (not currently exposed).

---

### `GET /agent`

List all currently running agent IDs.

**Request:** No body, no params.

**Response 200:**
```json
{ "running": ["uuid-1", "uuid-2"] }
```

**Important:** Returns only agents running in the current process's `runners` map. This is **in-memory state**, not DB state. An agent with `status = 'active'` in the DB is not guaranteed to appear here. After a process restart, this returns an empty array regardless of DB state.

---

### `GET /tasks`

Expose the dynamic task pool (for testing and `ApiTaskSource`).

**Query params:**
- `agentId` (optional string): passed to `DynamicTaskSource.fetchTasks()`. Accepted but does not affect output in Phase 1–2.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "type": "bounty",
    "cost": 980000,
    "revenue": 2900000,
    "payload": { "query": "fetch_sol_usdc_price" },
    "ttl_ms": 5000
  }
]
```

Results are non-deterministic (probabilistic availability, random variance on cost/revenue). Calling twice produces different results.

**Purpose:** Used by `ApiTaskSource` when pointing at `http://localhost:{PORT}`. Also useful for manual inspection of what tasks the simulator is generating.

---

---

### `GET /external/tasks`

Coordinator task feed. Returns available tasks for an agent to evaluate and execute.

**Source:** `src/external/coordinator.ts`. This is the mock coordinator. In production, `COORDINATOR_URL` points to an external real coordinator that implements the same contract.

**Query params:**

| Param | Type | Required | Default | Max |
|---|---|---|---|---|
| `agent_id` | `string` (UUID) | Yes | — | — |
| `limit` | `integer` | No | `5` | `10` |
| `cursor` | `string` | No | — | Pagination (not yet implemented; always `null` in response) |

**Response 200:**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "fetch_sol_usdc_price",
      "cost": 1020000,
      "revenue": 3150000,
      "payload": { "symbol": "SOL", "vs_currency": "usd", "source": "coingecko" },
      "ttl_ms": 10000,
      "expires_at": "2026-04-25T12:00:10.000Z"
    }
  ],
  "cursor": null
}
```

**Invariants enforced by the coordinator:**
- `cost` and `revenue` are positive integers (lamports, `±10%` / `±20%` variance from template base values)
- `expires_at` is always in the future relative to the time of the request
- No `confidence` field on any task or payload
- Task IDs are unique UUIDs; the same ID will not appear in two consecutive responses unless the pool has not replenished

**Response 400:**
```json
{ "error": "agent_id is required" }
```

**Notes:** The coordinator replenishes the task pool on every request. Expired uncompleted tasks are evicted. Pool sizes per task type: `fetch_sol_usdc_price` (3), `fetch_eth_usdc_price` (3), `fetch_btc_dominance` (2), `deep_orderbook_analysis` (1).

---

### `POST /external/tasks/:id/complete`

Payment confirmation. Called by the agent after completing work. Coordinator validates the completion and confirms or rejects payment.

**Source:** `src/external/coordinator.ts`.

**Path params:**
- `id`: UUID of the task being completed

**Request body:**
```json
{
  "agent_id":     "agent-uuid",
  "result":       { "price": 145.32, "symbol": "SOL/USDC", "source": "coingecko" },
  "execution_ms": 234
}
```

| Field | Type | Required | Constraint |
|---|---|---|---|
| `agent_id` | `string` | Yes | Any non-empty string |
| `result` | `object` | Yes | Must be a non-empty object (at least one key) |
| `execution_ms` | `number` | No | Not validated — informational |

**Response 200 (confirmed):**
```json
{ "confirmed": true, "task_id": "uuid", "revenue": 3150000 }
```

`revenue` is the exact lamport amount the agent should call `earn()` with. It matches the `revenue` field from when the task was served.

**Response 200 (rejected):**
```json
{ "confirmed": false, "task_id": "uuid", "reason": "expired" }
```

| `reason` value | Meaning | Agent action |
|---|---|---|
| `expired` | `expires_at < now` when complete was called | Absorb cost (prediction failure) |
| `already_completed` | Another agent or a duplicate call completed this task first | Absorb cost (prediction failure) |
| `invalid_result` | `result` is missing or empty | Absorb cost (prediction failure) |

**Response 400:**
```json
{ "error": "agent_id is required" }
```

**Response 404:**
```json
{ "error": "task_not_found" }
```

**Idempotency:** NOT idempotent. The first call that reaches `confirmed: true` marks the task as completed. All subsequent calls for the same task ID return `{ confirmed: false, reason: 'already_completed' }`.

**Agent behavior contract (from `strategy/dataFetch.ts`):**
- Agent calls `spend()` before calling this endpoint
- Agent calls `earn(revenue)` only if `confirmed: true`
- If coordinator is unreachable or returns 5xx → infrastructure failure → `earn(cost, cost_refund)`
- If coordinator returns 404 or `confirmed: false` → prediction failure → absorb cost

---

## 3. Error Response Format

**Current format (Phase 1–2):**

```json
{ "error": "<string message>" }
```

This format is **temporary**. It will be replaced in Phase 3 with a structured format:

```json
{
  "error": {
    "code": "agent_not_found",
    "message": "Agent not found: <detail>",
    "details": {}
  }
}
```

**Do not build clients that depend on parsing the `error` string value.** Treat it as opaque until the structured format is defined.

---

## 4. Idempotency Summary

| Endpoint | Idempotent? | Notes |
|---|---|---|
| `GET /health` | ✅ Yes | Read-only |
| `POST /agent/create` | ❌ No | Creates a new agent on every call |
| `GET /agent/:id` | ✅ Yes | Read-only |
| `GET /agent/:id/transactions` | ✅ Yes | Read-only |
| `POST /agent/:id/run` | ✅ Effectively yes | Returns 409 if already running |
| `POST /agent/:id/stop` | ❌ No | Returns 404 if not running |
| `GET /agent` | ✅ Yes | Read-only (in-memory) |
| `GET /tasks` | ❌ No | Non-deterministic output |
| `GET /external/tasks` | ❌ No | Non-deterministic; pool replenishes on every call |
| `POST /external/tasks/:id/complete` | ❌ No | First success claims; subsequent calls return rejected |

---

## 5. Versioning

No version prefix exists currently. All routes are unversioned (`/agent/...`, `/tasks`).

Versioning is **planned before Phase 3**. Expected approach: prefix with `/v1/` (`/v1/agent/...`). The unversioned routes would either be deprecated or aliased.

No decision has been made on versioning strategy (URI versioning vs. header versioning). URI versioning (`/v1/`) is the expected default.

---

## 6. Authentication

**Phase 1–2:** No authentication. Any client with network access to the server can call any endpoint.

**Phase 3 plan (TBD):** Two separate auth layers are expected:

| Actor | Auth mechanism |
|---|---|
| Operator (creates, starts, stops agents) | Separate auth (API key or JWT) |
| External task posters (Phase 3) | Separate auth (API key or signed requests) |

The exact mechanism is not decided. API keys are the expected default for initial Phase 3 implementation.

**Risk note:** Until auth is implemented, this server must not be exposed on a public network.

---

## 7. Request Validation

**Current approach:** Manual validation in route handlers.

Example:
```ts
if (!['bounty'].includes(strategy)) {
  res.status(400).json({ error: `Unknown strategy: ${strategy}` });
  return;
}
```

**Planned:** Schema validation library (Zod or equivalent). Not yet implemented. When added, validation must remain at the HTTP layer — strategy business logic must not be in the validator.

---

## 8. Phase 3 API Changes Expected

| Change | Description |
|---|---|
| Auth middleware | Required on all state-modifying routes |
| Versioning prefix | `/v1/` prefix |
| Structured error format | `{ error: { code, message, details } }` |
| Schema validation | Request body validation via Zod or equivalent |
| Agent pause/resume routes | `POST /agent/:id/pause`, `POST /agent/:id/resume` |
| Agent terminate route | `POST /agent/:id/terminate` |
| Task submission endpoint | Mechanism for external actors to post tasks (design TBD) |
| Balance top-up route | For operator to fund agent wallet (design TBD) |

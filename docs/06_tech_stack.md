# 06 — Tech Stack

```
Version: v1.1
Last Updated: 2026-04-25
Changes:
- Added Phase 3 environment variables: TASK_SOURCE, COORDINATOR_URL.
  No new runtime dependencies added. All Phase 3 work uses Node.js built-in fetch.
```

---

## 1. Runtime

| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript | `^5.8.2` |
| Runtime (dev) | Node.js via `tsx` | `^4.19.2` |
| Runtime (prod) | Node.js | LTS (unspecified) |
| Build | `tsc` | `^5.8.2` |

**Bun**: `bun.lock` is present in the repository but is not authoritative. Bun is not used intentionally. The canonical runtime is Node.js. Ignore `bun.lock` for architecture and deployment decisions.

Dev command: `tsx watch src/index.ts`
Prod command: `node dist/index.js` (after `tsc` build)

---

## 2. Dependencies

### Runtime dependencies

| Package | Version | Purpose | Rationale |
|---|---|---|---|
| `express` | `^4.21.2` | HTTP server and routing | Chosen for simplicity, stability, and zero abstraction overhead for a small control-plane API. Not Fastify or Hono — those offer performance gains not relevant at this scale. Not raw `http` — Express middleware composition is sufficient. |
| `@supabase/supabase-js` | `^2.49.4` | Database client (Postgres via Supabase) | Chosen to leverage Postgres RPC functions for atomic financial operations without building a custom DB abstraction layer. Supabase's client exposes `.rpc()` cleanly; raw Postgres drivers would require more ceremony for the same result. |
| `@solana/web3.js` | `^1.98.0` | Solana keypair generation | Chosen as the lowest-level stable SDK for keypair generation and future transaction signing. Anchor (`@coral-xyz/anchor`) was not chosen because it adds abstractions (programs, IDLs) not needed for keypair generation. v1 is used because v2 (`@solana/kit`) is a breaking rewrite that has not been evaluated for Phase 3 compatibility. |
| `dotenv` | `^16.4.7` | Environment variable loading | Standard, no alternatives considered necessary. |

### Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | `^5.8.2` | Type checking and compilation |
| `tsx` | `^4.19.2` | TypeScript execution without compile step (dev) |
| `@types/express` | `^4.17.21` | Express type definitions |
| `@types/node` | `^22.0.0` | Node.js type definitions |

---

## 3. Technology Rationale Details

### Why `tsx` + `tsc` (not `esbuild`, `swc`, or `bun build`)

- `tsx`: enables fast TypeScript execution in development without a separate compile step. No bundling, no build artifacts during iteration.
- `tsc`: provides strict type checking and generates clean `dist/` output for production. No runtime transformer introduces ambiguity.
- `esbuild`/`swc` were not chosen — they bypass `tsc` type checking, which is unacceptable for a financial system where type safety is a correctness tool.

### Why AES-256-GCM for private key encryption

Chosen deliberately, not as a default:

- **AES-256-GCM** provides both confidentiality (encryption) and integrity (authenticated tag). A tampered ciphertext is detected before decryption.
- Alternative (AES-256-CBC) provides confidentiality only — no tamper detection.
- The auth tag makes key corruption detectable, which matters for a system where decrypting a corrupted key would produce a silent invalid wallet.

Encryption spec (from `src/crypto/keys.ts`):

```
Algorithm:   AES-256-GCM
Key:         256-bit (32 bytes), from ENCRYPTION_KEY as 64 hex chars
IV:          96-bit, randomly generated per encryption (never reused)
Auth tag:    128-bit, stored with ciphertext
Format:      <iv_b64url>:<authTag_b64url>:<ciphertext_b64url>
```

---

## 3.5. External HTTP APIs (Phase 3)

Phase 3 makes live HTTP calls to external APIs. No new packages are used — all requests use the Node.js built-in `fetch` (available since Node 18+).

| API | Used for | Auth |
|---|---|---|
| CoinGecko v3 (`https://api.coingecko.com/api/v3`) | Price feeds, BTC dominance, Binance ticker/orderbook data | None (free tier, no key required) |

**Rate limit consideration:** CoinGecko free tier allows approximately 10–30 requests/minute. The agent loop will hit this limit if many agents run simultaneously or loop frequency is high. Rate limit responses (`HTTP 429`) are classified as infrastructure failures — the agent refunds the cost and applies exponential backoff at the runner level.

**No COINGECKO_API_KEY env var is defined.** If the free tier is insufficient, a key can be added to the request headers in `work/handlers.ts`.

---

## 4. Database

| Component | Choice | Status |
|---|---|---|
| Database | Postgres (via Supabase managed hosting) | Current and acceptable |
| Client | `@supabase/supabase-js` v2 | Current |
| Auth used | Service role key (bypasses RLS) | Phase 1–2 |
| Financial operations | Postgres stored procedures (RPC) | Permanent |

Supabase is **not the permanent final choice** — it is an acceptable convenience for Phase 1–2. The stored procedures (`record_spend`, `record_earn`, `record_resale`) are the durable part of this choice. They would survive a migration to raw Postgres with minimal change.

**Service role key**: the application uses the Supabase service role key, not the anon key. The service role key bypasses Row Level Security. In Phase 3, before any public-facing deployment, this must be revisited — either RLS is configured, or the DB is not directly accessible from external contexts.

---

## 5. Missing Tooling

The following are intentionally absent in Phase 1–2. They are planned but not scheduled.

| Tool | Status | Notes |
|---|---|---|
| Test framework | ❌ Not present | Planned. Likely Vitest or Jest (not decided). |
| Linter (ESLint/Biome) | ❌ Not present | Planned. |
| Formatter (Prettier/Biome) | ❌ Not present | Planned. |
| CI pipeline | ❌ Not present | Planned. |
| Type coverage enforcement | ❌ Not present | `tsc` strict mode is the current substitute. |

These are absent because Phase 1–2 focus was economic correctness, not tooling infrastructure. They are not optional forever — they must be in place before Phase 3.

---

## 6. Dependency Philosophy

The runtime dependency count is deliberately minimal (4 packages).

**Principle:** No dependency without clear necessity.

Any new runtime dependency must justify:
1. Why the needed behavior cannot be implemented internally with reasonable effort
2. What invariant, correctness property, or capability it enables that does not exist without it

This principle exists because:
- Each dependency is a supply chain risk (see prior industry incidents with npm packages)
- Financial systems have a higher correctness bar than general applications
- Small dependency surface = faster audits, fewer upgrade surprises

This is **intentional minimalism**, not accidental. Adding a utility library for convenience is not sufficient justification.

---

## 7. Key Versions and Upgrade Notes

| Package | Current | Upgrade Risk | Notes |
|---|---|---|---|
| `@solana/web3.js` | `^1.98.0` | High | v2 (`@solana/kit`) is a breaking rewrite. Not evaluated. Pin to v1 until Phase 3 assessment. |
| `@supabase/supabase-js` | `^2.49.4` | Medium | Supabase v2 client is stable. Minor versions safe. Major version would need testing against RPC calls. |
| `express` | `^4.21.2` | Low | Express 5 exists but is not yet widely stable. v4 is acceptable. |
| `typescript` | `^5.8.2` | Low | Minor TS upgrades generally safe. Strict mode flag prevents most silent breakage. |

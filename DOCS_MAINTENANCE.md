# Documentation Maintenance Instructions

```
Version: v1.0
Last Updated: 2026-04-25
Changes:
- Initial version of documentation maintenance protocol
```

---

## Purpose

This document defines how the `/docs` folder must be maintained.

The documentation is a **source of truth**, not a reference.
It must always reflect the current behavior of the system.

Do not treat `/docs` as supplementary. If the code and the docs disagree, one of them is wrong — determine which before proceeding.

---

## Core Principle

> Every code change that alters system behavior, invariants, or contracts must have a corresponding documentation update — or an explicit, recorded reason why not.

---

## Role of the Agent or Developer

Not a writer. Not a summarizer.

Responsible for:
- Maintaining consistency between code and documentation
- Preventing documentation drift
- Enforcing that system invariants are accurately represented in written form
- Asking questions when behavior is ambiguous rather than assuming

---

## Mandatory Workflow

---

### Step 1 — Analyze the Code Change

For every commit or diff:

1. Read the full diff
2. Identify:
   - Which files changed
   - What logic was modified, added, or removed
   - Which system invariants are affected (see `/docs/10_constraints_and_rules.md`)
   - Whether any phase boundary was crossed or a phase completion criterion changed

If anything about the intent or effect of the change is unclear:

> **STOP. Ask. Do not assume.**

Assumptions in financial systems produce silent errors.

---

### Step 2 — Map Changes to Documentation Files

| Change Type | Primary File | Secondary File (if applicable) |
|---|---|---|
| Project scope, what system does/doesn't do | `01_overview.md` | — |
| Core problem definition or solution mechanism | `02_problem_and_solution.md` | — |
| Module structure, data flow, component dependencies | `03_system_architecture.md` | — |
| Profit formula, transaction types, capital policy | `04_economic_model.md` | — |
| Phase status, completion criteria, known unknowns | `05_phase_breakdown.md` | — |
| Dependencies, runtime, tooling | `06_tech_stack.md` | — |
| Agent states, lifecycle, identity, runner behavior | `07_agent_design.md` | `03_system_architecture.md` |
| Database schema, table purposes, write tiers, cache | `08_data_and_reuse.md` | `03_system_architecture.md` |
| HTTP routes, request/response shape, error format | `09_api_design.md` | — |
| Invariants, operator rules, locked decisions, naming | `10_constraints_and_rules.md` | — |

If a change touches multiple areas, update **all** affected files. Do not update only the most obvious file and leave the others stale.

---

### Step 3 — Update the Documentation

Rules:

- Modify only the affected sections. Do not rewrite unrelated content.
- Do not rewrite entire files unless the change is structural (e.g., a full phase was completed).
- Preserve all existing invariants, constraints, and edge cases unless they were explicitly changed.
- Replace vague statements with precise ones. Never introduce "this improves X" or "this is more efficient" language.

Every update must:
- Reflect **actual code behavior** as it exists after the change
- Include precise technical detail (types, formulas, DB behavior, API shape)
- Avoid generic or forward-looking language unless marking something explicitly as `[PLANNED]` or `[TBD]`

---

### Step 4 — Update the Version Block

At the top of every modified file, update the version block:

```md
Version: vX.Y
Last Updated: YYYY-MM-DD
Changes:
- <exact description of what changed and why>
```

Version increment rules:

| Change Severity | Version Bump | Example |
|---|---|---|
| Minor update (clarification, added detail, fixed wording) | Patch: `v1.0 → v1.1` | Added a missing edge case |
| Behavioral change (logic, formula, flow, schema altered) | Minor: `v1.0 → v2.0` | Profit formula updated |
| Phase transition or architectural redesign | Major: `v1.0 → v2.0` on all affected files | Phase 3 begins |

**Do not use the same version number after a change.** The version block is a changelog, not a label.

---

### Step 5 — Cross-Check Consistency

Before finalizing any documentation update:

1. Read all files that were NOT updated in this change
2. Confirm that nothing in those files now contradicts the updated content
3. Check specifically:
   - Does `03_system_architecture.md` still accurately describe the module structure?
   - Does `10_constraints_and_rules.md` still list the correct invariants?
   - Does `05_phase_breakdown.md` still accurately reflect phase status?

If a contradiction is found, resolve it — do not leave two files with conflicting information.

---

## What Triggers a Documentation Update

### Always requires an update

| Event | Files affected |
|---|---|
| New API route added or existing route changed | `09_api_design.md` |
| New table added or existing schema changed | `08_data_and_reuse.md` |
| New strategy registered | `03_system_architecture.md`, `07_agent_design.md` |
| Profit formula modified | `04_economic_model.md`, `02_problem_and_solution.md` |
| Confidence algorithm changed | `04_economic_model.md`, `03_system_architecture.md` |
| Agent state machine changed | `07_agent_design.md` |
| New environment variable added | `06_tech_stack.md` |
| Phase 1–2 limitation resolved | `05_phase_breakdown.md`, `03_system_architecture.md` |
| Any invariant added, removed, or relaxed | `10_constraints_and_rules.md` |
| Phase 3 begins (any component) | `05_phase_breakdown.md`, all affected files |

### May not require an update (document the reason)

| Event | Reason no update may be needed |
|---|---|
| Internal refactor with no behavioral change | Code structure changed; external behavior, invariants, and API unchanged |
| Comment or log message update | No system behavior changed |
| Dev tooling added (linter, formatter) | Document in `06_tech_stack.md` only if it becomes part of the required workflow |

When skipping a documentation update, add a note in the commit message:

```
docs: no update required — internal refactor, behavior unchanged
```

---

## Documentation File Index

| File | Contents |
|---|---|
| `01_overview.md` | System definition, core loop, what it is and is not, phase state, infrastructure |
| `02_problem_and_solution.md` | Problem statement, failure modes, solution mechanisms (Phase 1–2 scope) |
| `03_system_architecture.md` | Module map, stability classification, data flow, write tiers, dependency graph |
| `04_economic_model.md` | Objectives, profit formula, transaction model, capital policy, failure economics |
| `05_phase_breakdown.md` | Phase definitions, testable completion criteria, inter-phase rules, known unknowns |
| `06_tech_stack.md` | Runtime, all dependencies with rationale, missing tooling, version notes |
| `07_agent_design.md` | Agent definition, state machine, runner lifecycle, isolation guarantees |
| `08_data_and_reuse.md` | All table schemas, write consistency tiers, cache design, reuse economics |
| `09_api_design.md` | All endpoints with schemas, error format, idempotency, versioning, auth status |
| `10_constraints_and_rules.md` | All invariants (enforced and not), operator rules, locked decisions, naming |

---

## Hard Rules

**Never do these:**

1. Do not update documentation to match an assumption about code — read the code first.
2. Do not write vague statements: "improved performance", "better error handling", "more robust logic". Describe what changed and how.
3. Do not invent information for TBD areas. Mark them `[TBD]` or `[PLANNED: Phase X]`.
4. Do not contradict a previous file without explicitly noting the contradiction was resolved.
5. Do not skip the version block update. A file that changed without a version update has no change history.
6. Do not merge documentation for separate concerns into one section. If two things changed, document them separately.

---

## Writing Style Rules

These apply to all documentation in `/docs`:

- Write like a backend engineer, not a product manager.
- Be explicit about: data types, state transitions, conditions, failure modes, and edge cases.
- Use tables for comparative or multi-column information.
- Use code blocks for: SQL, TypeScript, formulas, API shapes, CLI commands.
- Prefer clarity over brevity. A longer sentence that is unambiguous is better than a short sentence that requires interpretation.
- Avoid: "scalable", "efficient", "intelligent", "smart", "robust", "powerful", "seamless".
- Include: exact values, exact formulas, exact conditions, exact error strings where they exist in code.

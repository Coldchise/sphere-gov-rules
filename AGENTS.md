# Universal AGENTS.md — Master Agent Rulebook

> **This is the master rulebook for every project.** Each project root contains an identical copy named `AGENTS.md`. This `documentation/` repository is the single source of truth — when this file changes, every project copy must be synchronized.
>
> **This file is read at every session start AND re-read before every commit. It is never a one-time read.**

---

## 0. Mandatory Read Protocol

### A. Session Start

Before writing a single line of code, you must read, in full:

1. **This `AGENTS.md`** — completely, top to bottom.
2. **`backend/`** — all backend coding practices, setup guides, library setup, and any `agent-mistakes/` material found there.
3. **`frontend/`** — all frontend coding practices, setup guides, library setup, and any `agent-mistakes/` material found there.
4. **`agent-testing-starter/`** — `src/tests/README.md`, `src/tests/docs/testing-overview.md`, and `src/tests/docs/agent-rules.md`. This is how testing is done and set up in every project (Section 2.E).
5. **`agent-mistakes/<project-name>/`** — every mistake entry for the project you are working on.

### B. Commit-Time Re-Read (Strict — Memory Is Not Enough)

Before **every** `git commit`, without exception:

1. Stop. Re-read this `AGENTS.md` and `git rules.md` **from disk**. Never rely on what you remember from earlier in the session.
2. Re-read the current project's `agent-mistakes/` entries.
3. Run the Pre-Commit Quality Gate (Section 2.B). Fix → rerun → only commit when green.

### C. Documentation Map

```text
documentation/
├── AGENTS.md                               ← this master file
├── git rules.md                            ← branching, commits, PRs, security
├── error-handling-and-monitoring-policy.md ← frontend + backend error policy
├── agent-testing-starter/                  ← testing setup, configs, agent rules, tool guides
├── backend/                                ← backend rulebook + setup/library guides + mistakes
├── frontend/                               ← frontend rulebook + setup/library guides + mistakes
└── agent-mistakes/                         ← per-project mistake logs
    └── <project-name>/
        └── NNN-<short-title>.md
```

---

## 1. Role & Communication Framework (The Expert Teacher)

### A. The "Teacher-First" Response Pattern

You do not merely dump code changes or issue silent modifications. You operate as a senior full-stack architect and developer instructor. For every technical choice, design application, or structural adjustment, you must provide a clear educational explanation including:

- **The "Why":** The underlying engineering rationale, security motivation, or architecture decision.
- **The "How":** A breakdown of how the logic flows, how data transforms, or how UI elements stack.
- **The Exact Source:** Every code block must state the target file path and the explicit structural snippet being inserted or replaced. No abbreviated or truncated placeholders (`// rest of your code here...`).

### B. Anti-Assumption Clause

- **Be Explicitly Specific:** You are strictly forbidden from guessing, assuming, or filling in layout gaps with your own design intuition.
- If a visual implementation detail, asset reference, backend requirement, or user flow is omitted or ambiguous, you must halt operations immediately and request permission or detailed clarity.
- **Zero Unnecessary Files:** Never create unprompted utility helpers, secondary styling sheets, custom hooks, or decorative configurations unless explicitly directed or unless you have explicitly asked and received confirmation.

---

## 2. Universal Engineering Non-Negotiables

### A. Environment & Configuration Policy (Zero Exceptions)

**Law 1 — All configuration lives in `.env` files.**
Never code environment values into application source, from the backend or the frontend.

**Illegal — never generate this:**

```ts
// ILLEGAL: inline env fallbacks are banned in every project
const host = process.env.MASTER_DB_HOST || "localhost";
const apiUrl = process.env.API_URL ?? "http://localhost:3000";
```

Inline fallbacks mask broken deployments and misconfigured environments. Reading `process.env` is allowed **only** inside one central, validated configuration module per project (e.g. `src/config/env.ts`); all other code imports typed config values from that module.

**Law 2 — Standard env structure for every project (frontend and backend):**

```text
.env                 # Base values for the environment (never committed)
.env.local           # Developer-local overrides (never committed)
.env.production      # Production-only values, injected by the host (never committed)
.env.example         # Committed template: every variable, dummy values, short description
```

Load precedence (Next.js standard, highest wins): `.env.local` → `.env.production` → `.env`. Variables injected by the host environment always override every env file.
`.env.example` is the only env file that is committed, and it must always be complete.

**Law 3 — Fail loud, never silent.**
If a required variable is missing or invalid, the application must fail fast at startup with a clear message listing every missing variable. A missing env value must never be masked by a fallback value.

**Law 4 — Parity is mandatory.**
Any add, rename, or removal of an environment variable must update `.env`, `.env.local`, `.env.production`, and `.env.example` in the same change. Never leave environment dependencies undocumented.

**Law 5 — Secrets never reach the browser.**
Frontend code may read only `NEXT_PUBLIC_*` variables. All secrets belong in the backend's `.env` files only.

### B. Git & Commit Protocol

**Canonical workflow: `git rules.md`.**
Branch naming, Conventional Commits, PR flow, merge rules, and security safeguards are defined there. It is mandatory, not advisory.

**Pre-Commit Quality Gate — all four gates must pass, every time:**

1. **Typecheck**
2. **Lint**
3. **Tests**
4. **Production build**

Rules of the gate:

- Run the gates for every project you changed (frontend and/or backend).
- If **any** gate fails: fix the root cause, then **rerun all four gates from scratch**. A fixed lint error does not excuse skipping the tests.
- Commit only when everything passes. Never commit with a failing gate "to fix later". Never use `--no-verify` or bypass hooks.
- The commit itself follows the Commit-Time Re-Read (Section 0.B) and the Conventional Commits format from `git rules.md`.

### C. Error Handling & Monitoring

**Canonical policy: `error-handling-and-monitoring-policy.md` — mandatory for both frontend and backend.** Hard rules:

- All API errors use the single standardized error structure with stable machine-readable codes (`VALIDATION_ERROR`, `FORBIDDEN`, `RECORD_NOT_FOUND`, and so on).
- Business errors (validation, authentication, not-found, conflicts, rate limits) are **not** `500`s and never trigger production alerts.
- `500`s: log the full technical error internally, alert asynchronously (e.g. Discord), and return a safe response with a traceable `requestId`.
- Never expose stack traces, SQL errors, internal class names, credentials, tokens, or cookies — in API responses, alert channels, logs, or UI.
- The frontend shows safe human-readable messages with retry affordances — never technical text.

### D. Documentation & Structure Maintenance

- Keep each project's `filestructure.md` map aligned with the real file tree whenever files are created, renamed, or removed.
- Keep the rulebooks (`frontend/`, `backend/`) current — they are living documents, not archives.
- Environment parity is enforced by Section 2.A (Law 4).

### E. Testing & Test Setup (Mandatory)

**Canonical source: `agent-testing-starter/`** — this is how tests are set up and written in every project. No other testing convention applies.

- **Tests always live inside `src/`** — `frontend/src/tests/` and `backend/src/tests/`. A root-level `tests/` folder is never allowed in any project.
- **Setting up testing in a project:** copy the kit into the project (`src/tests/` structure plus root `vitest.config.ts`, `playwright.config.ts`, `.env.test.example`, and scripts from `package.testing.scripts.example.json`) following `agent-testing-starter/src/tests/README.md`. Install only what the project's stack actually needs; never replace existing configs blindly.
- **Before writing, running, or changing any test:** read `src/tests/README.md`, then `src/tests/docs/testing-overview.md`, then `src/tests/docs/agent-rules.md`, then the tool guide for the layer involved.
- **Choose the layer by risk:** Vitest units → Supertest / Testcontainers integration → Playwright E2E → Postman CLI for API collections. Tests live in `src/tests/unit/frontend/`, `src/tests/unit/backend/`, `src/tests/integration/backend/`, `src/tests/e2e/`, or `src/tests/postman/`.
- **Templates are not tests.** `.example.*` files must be connected to the real implementation, renamed (`.test.ts` / `.test.tsx` / `.spec.ts`), and executed before anything is reported as passing. `0 tests found` means **not tested** — never "passed".
- **Never weaken a test to make it green:** no `skip`, no `expect(true).toBe(true)`, no broad `try/catch`, no sleeps as synchronization, no mocking away the behavior under test.
- **Never point destructive tests at production, shared, or customer databases.** Keep secrets, tokens, storage state, and PII out of test files, fixtures, logs, screenshots, and reports.
- **Reporting:** use the required completion-report format from `docs/agent-rules.md` — actual commands, real pass/fail/skip counts, explicit "not run" reasons.
- The test run is one of the four gates in the Pre-Commit Quality Gate (Section 2.B) — never commit when tests fail or are skipped.

---

## 3. Frontend Canonical Sources

Before any frontend task, read everything inside **`frontend/`**: start with `frontend/guide.md` (the routing entry point), then the coding practices, setup guide, user-manual guide, `library-setup and guide/`, and any `agent-mistakes/` material stored there.

Hard reminders (full detail lives in `frontend/coding-practice-guide.md`):

- Use the existing component system first (shadcn + design tokens). Never invent a duplicate UI primitive; ask before introducing a new reusable pattern.
- **No spontaneous UI:** no unrequested layouts, margins, buttons, or redesigns.
- **Pixel-perfect mirroring** when replicating a reference design: exact element tree, identical nesting, matching utility classes.
- **Exactly one loading state** per element (never spinner + skeleton simultaneously). Skeletons mirror the real geometry of the specific module — never generic catch-all wireframes.
- No fake loading, and no fallbacks that hide bugs. Always ask the owner before implementing fallback behavior.
- **Next.js App Router:** Server Components are the default; `"use client"` only at the smallest interactive leaves — never blanket-mark pages or layouts. Routes follow `app/` conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- **TanStack Query owns client-side server state** — never mirror fetched data into global UI stores or duplicated `useState`.

---

## 4. Backend Canonical Sources

Before any backend task, read everything inside **`backend/`**: `backend/rules.md` (the full rule set), setup guides, library guides, and any `agent-mistakes/` material stored there.

Hard reminders (full detail lives in `backend/rules.md`):

Layered responsibility boundary — never bypass it:

```text
Route → Validation / Middleware → Controller → Service → Repository / Data Access → Database
```

- Minimal `app.ts`; relative routes only; thin controllers; pure services (no `req`/`res`/`next`).
- Multi-tenant isolation and ownership checks on every query — never fetch a record by user-supplied ID without verifying authorization.
- Zero N+1 queries; strict field selection; deterministic ordering on every paginated query.

---

## 5. Agent Mistakes Protocol

### A. Architecture (Mandatory)

```text
agent-mistakes/
└── <project-name>/
    ├── 001-<short-title>.md
    ├── 002-<short-title>.md
    └── ...
```

- One folder per project; one mistake per `.md` file; sequential numbering inside the project folder.
- Never edit or delete past entries — history is the point. Corrections are new entries.
- Mistake material discovered under `frontend/` or `backend/` follows this same entry format.

### B. Pre-Flight Read (Strict)

Before writing code, and again before committing, read **every** entry in `agent-mistakes/<current-project>/`. Treat them as hard-earned rules — the same mistake must never be introduced twice.

### C. Entry Format

```markdown
# Agent Mistake Entry — NNN — [Short Title] ([YYYY-MM-DD])

## 1. Context of Task

- What was requested; which component, service, or file was targeted.

## 2. The Mistake Made

- Exactly what was generated incorrectly and which rule it violates.

## 3. Resolution & Code Difference

- The corrected snippet alongside the "how/why" explanation that prevents recurrence.
```

### D. When To Write One

- After any agent-generated bug, rule violation, or misalignment that had to be corrected.
- After any broken build, lint, test, or gate failure caused by an agent mistake.
- Log it before the related task is considered finished.

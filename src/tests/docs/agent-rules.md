# Mandatory rules for AI coding agents that create tests

Treat this as a pull-request acceptance checklist. Apply it to every frontend, backend, and full-stack change.

## Before writing tests

1. Inspect the repository structure, package manager, existing tests, routes, schemas, authorization and storage layer. Never invent missing app APIs, filenames, environment variables or selectors.
2. Identify critical user journeys and risk. Create a small test matrix: happy/negative/edge/security.
3. Reuse existing Vitest/Playwright config and utilities; propose changes if there is an existing test standard. Do not duplicate runners or components.
4. State exactly which environment is targeted, e.g. local `test` database with synthetic records; refuse destructive tests against production.
5. Ask for approval before a new major test framework, persistent service, expensive external integration, privileged browser agent, or changed CI permissions if project policy requires approval.

## During implementation

1. Put durable tests under `src/tests/unit/frontend/`, `src/tests/unit/backend/`, `src/tests/integration/backend/`, `src/tests/e2e/`, or `src/tests/postman/`.
2. A test must call the actual function, component, HTTP route, or database migration. Do not add demo-only passing assertions to make a build green.
3. Use clear `it('...')` names with actual business outcome; Arrange/Act/Assert; one core behavior per test.
4. In React, prefer accessible `getByRole`/`getByLabelText`; use `findBy` for async UI; don't assert React internal state or class names unless styling itself is under test.
5. In backend APIs, test status, response shape, correct auth semantics, data side effect, cross-tenant isolation and safe errors.
6. Mock only external boundaries in unit tests (network, clock, email, payment), and verify some paths at an integration level without the mock.
7. Never change production code solely to satisfy a contrived test; investigate spec first. No blanket `skip`, silent catches, `expect(true).toBe(true)`, brittle snapshots, fixed sleeps or excessive timeout increases.
8. Avoid shared mutable fixtures. Use factories and unique identifiers, clear rows in test DB, close connections, release containers and browser contexts.
9. Do not test private class members or internal function call counts unless those calls are the actual contract.
10. Keep real secrets, credentials, tokens, storage state and PII out of test files, logs, screenshots and reports.
11. For authorization, enforce rules in backend, not just a disabled/hidden frontend button. Include regular user accessing admin route (403) and unauthenticated request (401).
12. On test failure, show actual failure; do not silently ignore, mock around it, disable it, or say 'passed'.
13. Use deterministic clocks and fixtures where needed. Avoid snapshot assertions on dynamic IDs, times, HTML trees.
14. Keep test names stable; run affected tests first, then broader suites. Keep browser tests focused on high-value journeys for performance.
15. Require a tested, evidence-backed performance budget if checking response times; avoid strict timing assertions in noisy CI.

## Agent completion report (required)

```text
Implemented: <feature>
Created/updated tests: <exact paths>
Cases covered: <happy, invalid, unauthorized, etc.>
Commands executed: <exact command>
Results: <N passed, M failed, K skipped>
Environment: <versions, local/test DB, browsers>
Not run: <specific reason; Docker unavailable, no app running, etc.>
Risks/remaining gaps: <what is not verified>
```

If tests haven't been connected to real application files, label them **templates/not executed**. If `0 tests found`, that is **not tested**, not passing.

## Copyable AI agent prompt

> Read `src/tests/README.md`, `src/tests/docs/testing-overview.md`, `src/tests/docs/agent-rules.md` and the relevant tool guide. Inspect source before writing tests. For this feature, add actual behavior-driven tests in the appropriate `src/tests/` folder (unit, integration and E2E according to risk). Reuse current libraries, add negative/security cases, use synthetic isolated fixtures, never touch production or leak secrets. Execute focused and relevant suites; provide actual pass/fail/skip counts and list untested cases. Do not add placeholder passing tests or disable failing assertions. Request approval before changing testing architecture or requiring privileged tools.

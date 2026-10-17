# Test architecture and decision guide (read first)

**Audience:** autonomous coding agents / vibe-coding IDE assistants building React + TypeScript frontends and Node.js/TypeScript backends. Adapt setup when the repository uses Next.js, NestJS, Fastify, Prisma, Drizzle, pnpm, Turborepo, etc. Never assume the sample stack is already installed.

## 1. Goals

1. Catch broken behavior and regressions before release.
2. Keep a permanent test file for every critical contract, state transition, and security boundary.
3. Make fast tests the default; run slower real-database and browser tests where they add confidence.
4. Make failed tests actionable; avoid mock-heavy tests that only prove the mock behaves as written.
5. Protect live data and secrets while testing.

## 2. Choose the correct tool

| What needs proof? | Tool | Test folder | Runs against |
|---|---|---|---|
| Pure calculation, input validation, pagination utility | Vitest | `src/tests/unit/backend/` or `src/tests/unit/frontend/` | Real function, mocked external I/O if needed |
| React buttons, form errors, loading states, accessibility labels | Vitest + React Testing Library + user-event | `src/tests/unit/frontend/` | Actual component; mock network at boundary |
| HTTP route status, schema, auth, RBAC | Vitest + Supertest | `src/tests/integration/backend/` | Actual HTTP app (without binding a fixed port) |
| SQL migrations, constraints, transactions, repository queries | Vitest + Testcontainers | `src/tests/integration/backend/` | Disposable actual database |
| Login UI + API + DB work together | Playwright Test | `src/tests/e2e/` | Running app + test backend + disposable data |
| One-off browser reconnaissance while developing tests | Playwright Agent CLI | Agent tool, not permanent case | Local disposable app |
| Agent needs browser interaction through MCP tool calls | Playwright MCP | Agent integration, not a replacement runner | Local disposable app |
| Custom scripted browser operation without runner | `playwright` Library API | Development scripts; Playwright Test preferred for assertions | Browser |
| API regression / documented API checks | Postman CLI (Newman only for legacy v2.1) | `src/tests/postman/` | Backend test API only |

**Not Selenium:** the supplied Playwright docs describe Playwright tools. Unless Selenium is already an explicit project dependency, use Playwright Test for the E2E suite. Do not install redundant Selenium infrastructure.

## 3. Folder convention

- `src/tests/unit/frontend/`: React component tests; use `jsdom`, `screen.getByRole`, `userEvent`.
- `src/tests/unit/backend/`: pure service/domain/utility tests; node environment.
- `src/tests/integration/backend/`: actual API behavior; database/repository integration; Supertest + Testcontainers if needed.
- `src/tests/e2e/`: real user journeys through Playwright Test; include responsive, access-denied, and failure cases.
- `src/tests/postman/`: optional versioned **backend API** collections; do not place under frontend.
- `src/tests/setup/`: environment setup, matcher extensions, consistent cleanup.
- `src/tests/fixtures/`: synthetic builders; scoped unique data per test; no private data.
- `src/tests/helpers/`: shared helpers used across multiple tests; avoid hidden magic.
- Config files go in the repository root unless your workspace tools require otherwise.

## 4. Exactly how to make a test case

Use **Arrange → Act → Assert (AAA)**.

1. **Behavior:** write `should reject duplicate email with 409` rather than `test user route`.
2. **Precondition / fixture:** specify user role, initial rows, valid/invalid input, and empty-state assumptions.
3. **Action:** simulate a real click, request, or database operation.
4. **Observable assertion:** check user-visible UI or API response *and relevant side effect*, e.g. persisted row count.
5. **Negative test:** unauthorized, invalid, duplicate, missing, boundary, and race cases where relevant.
6. **Isolation:** reset mocks and data; tests must pass individually and in random order.
7. **Run:** save test under correct folder, run focused test, run appropriate suite, note any failure.

Example backend case definition:

```text
ID: API-USERS-004
Feature: Create user
Given: logged-in regular employee, admin-only endpoint
When: POST /api/users with valid body
Then: HTTP 403, no row inserted, no sensitive error details
Type: backend integration (Supertest + DB)
```

Example frontend case definition:

```text
ID: UI-TABLE-009
Feature: Data Table server pagination
Given: 100 rows on server, page size 10, page 1 loaded
When: click Next
Then: request has correct page/cursor, only new 10 rows rendered,
      table headers/sidebar remain visible, loading/error/empty state is clear
Type: frontend component + one browser E2E journey
```

## 5. Required scenarios for every feature

| Category | Minimum tests |
|---|---|
| Happy path | Valid input produces correct visible response and data change |
| Invalid input | Blank, incorrect type, oversize, malformed, special characters |
| Permission | Anonymous 401; logged-in but insufficient role 403; authorized success |
| Data integrity | Duplicate/uniqueness, transactions, delete scope, consistency |
| Errors | Friendly frontend message; structured safe API error; no secrets |
| Loading / concurrency | One loading state; disabled double-submit; no stale result overwrites |
| Data tables | Sorting, filtering, server pagination, selection scope, empty/error states |
| Data grids | Cell validation, edit/save failure, optimistic rollback, permissions, unsaved state |
| Mobile / accessibility | Keyboard, accessible names, responsive overflow, proper focus |
| Security | Injection resistance, no PII exposure, authentication/authorization |

### How many tests?

Prioritize behavior and risk, not arbitrary counts. A critical feature may need one unit case, several API integration cases and one happy-path E2E. Avoid testing the same trivial logic across every layer. Coverage is a warning signal, not evidence of correctness. Suggested starting gates: 80% statements/lines/functions, 75% branches for unit-testable code, adjusted by project risk. Security boundaries require explicit tests even with 100% coverage.

## 6. Fast production-ready workflow

- During edit: `vitest run path/to/file.test.ts`; run only relevant tests.
- Before PR: all frontend/backend unit tests + API integration tests + typecheck + lint.
- Before merging high-risk backend changes: run disposable DB migrations and repository cases.
- On CI / release: Playwright smoke journeys, security regression tests and API collection checks (if maintained).
- On failure: capture command, environment, expected/actual, root cause. Fix production code, not the assertion, unless the requirement was actually wrong.

## 7. Example scenario: HRIS employee management

- Unit backend: `normalizeEmployeeId`, safe page-size clamping, payroll hours calculations.
- React Testing Library: Add Employee dialog validates required fields; table headers never disappear on loading; friendly error message.
- Supertest: employee GET has correct pagination; admin can create, staff cannot; deletion never exposes a record from another tenant.
- Testcontainers: unique employee email constraint and transaction rollback verified against real Postgres.
- Playwright Test: login → go to Employees → search → add test employee → confirm table row → sign out.
- Postman: GET /api/employees returns expected status and JSON contract; missing token gets 401.

## 8. Version and evidence rules

Read **installed** package versions and current official docs before copying commands. Prefer the repository's lockfile over `@latest` in CI. Node.js, the Vitest minimum supported runtime, and Playwright browser binaries change; use a compatible, pinned version matrix. Browser agent tools use separate packages from Playwright Test.

See individual tool guides and `security-testing.md` for enforcement.

**Official references:**
- https://vitest.dev/guide/
- https://testing-library.com/docs/react-testing-library/intro/
- https://www.npmjs.com/package/supertest
- https://playwright.dev/docs/intro
- https://playwright.dev/agent-cli/introduction
- https://playwright.dev/mcp/introduction
- https://node.testcontainers.org/modules/postgresql/
- https://learning.postman.com/docs/collections/using-newman-cli/installing-running-newman

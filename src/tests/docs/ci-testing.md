# CI/CD testing pipeline for AI agents

**Goal:** fail fast, isolate expensive tests, never make a passing CI badge using skipped/mocked tests, and protect private data. This is a **plan**, not a repository-specific workflow that can safely be deployed without inspecting the user's CI infrastructure.

## Suggested pipeline

| Stage | Trigger | Required work | Failure policy |
|---|---|---|---|
| 1. Static checks | every PR | install from lockfile, typecheck, lint, dependency review | fail PR |
| 2. Unit frontend/backend | every PR | Vitest node/jsdom and coverage | fail PR |
| 3. Backend integration | PR touching API, auth, database | Supertest + Testcontainers as needed | fail PR |
| 4. E2E smoke | PR to critical UI + main branch | Playwright Test Chromium + isolated app and DB | fail PR |
| 5. API collection | API/release changes (optional) | Postman CLI against localhost disposable backend | fail PR |
| 6. Cross-browser/mobile | release/nightly | Playwright Test Firefox/WebKit/mobile subset | fail before release |

**Never** rely on branch paths alone to exempt high-impact security tests. Migrations, auth, payment, permissions and tenant isolation changes should trigger relevant tests. Keep caches but do not cache user data, tokens, browser storage state or unredacted debug artifacts.

## Example CI execution commands

```bash
npm ci
npm run typecheck     # use actual project script if available
npm run lint          # use actual project script if available
npx vitest run --project frontend-unit --project backend-unit
npx vitest run --project backend-integration
npx playwright install --with-deps chromium
npx playwright test --project chromium
# Optional: requires installed current Postman CLI + disposable API server
postman collection run src/tests/postman/example-api.postman_collection.json \
  -e src/tests/postman/local.postman_environment.json --bail
```

These commands **will not** be ready until all `.example` cases are connected to the real app, start scripts are correct, and test services are running. `npm ci` requires a lockfile and package.json dependencies. Never treat 'No tests found' as green. Use version-pinned GitHub Actions if building a real workflow; review `permissions:` and third-party actions before using them.

## Environment controls

- `NODE_ENV=test` and separate dedicated test DB, never real environment credentials.
- `CI=true` enables fail-on-`.only` behavior in Playwright config.
- Container-based integration requires a reviewed runner with Docker support; never configure overly privileged CI by default.
- E2E should use disposable accounts and a temporary DB with cleanup; parallel tests must have unique IDs.
- Artifacts: keep only failures, short retention, sanitized, restricted access.
- Secrets: CI secrets manager, minimal scopes; redact logs; avoid passing tokens as visible CLI arguments.

## Security regression before release

- 401 anonymous, 403 forbidden, cross-tenant BOLA/IDOR.
- Login/logout/expired token, secure cookie behavior when cookie-auth applies.
- Bad input/injection/mass assignment, server-side pagination limits.
- File upload limits, safe errors and no private data in response.
- Real database migration and constraints in Testcontainers when changed.

## AI agent completion obligations

Show exact commands and `N passed / M failed / K skipped` for each stage. Explicitly list what did not run and why. Fix test environment and application code appropriately; do not silently skip failing security tests or decrease assertion quality to achieve green.

**References:** https://vitest.dev/guide/coverage , https://playwright.dev/docs/ci , https://playwright.dev/docs/test-webserver , https://learning.postman.com/docs/postman-cli/postman-cli-run-collection

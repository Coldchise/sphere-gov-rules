# Testing system for AI coding agents

**Start here:** `docs/testing-overview.md`, then `docs/agent-rules.md`. Read the specific tool guide before changing tests. This is a repository-agnostic **starter kit**, not a claim that your existing application has been tested.

## Where everything belongs

```text
repo/ or frontend/ + backend/            # one project root per side
├── src/
│   └── tests/                           # ALL tests live INSIDE src — never at project root
│       ├── README.md
│       ├── docs/                        # separate AI-agent manuals
│       │   ├── testing-overview.md
│       │   ├── agent-rules.md
│       │   ├── vitest.md
│       │   ├── testing-library-react.md
│       │   ├── supertest.md
│       │   ├── testcontainers.md
│       │   ├── playwright-test.md
│       │   ├── playwright-library.md
│       │   ├── playwright-agent-cli.md
│       │   ├── playwright-mcp.md
│       │   ├── postman.md
│       │   ├── security-testing.md
│       │   └── ci-testing.md
│       ├── unit/
│       │   ├── frontend/                # .test.tsx + React Testing Library + Vitest
│       │   └── backend/                 # .test.ts + Vitest
│       ├── integration/backend/         # .test.ts + Supertest / Testcontainers
│       ├── e2e/                         # .spec.ts + Playwright Test
│       ├── postman/                     # backend API Postman collections/environments
│       ├── setup/                       # shared safe test setup
│       ├── fixtures/                    # synthetic data, no real people/secrets
│       └── helpers/                     # shared test-only helpers
├── vitest.config.ts                     # root config — include paths point into src/tests
├── playwright.config.ts                 # root config — testDir: ./src/tests/e2e
├── .env.test.example                    # safe template, never real secrets
└── package.testing.scripts.example.json # merge scripts into your actual package.json
```

In a split frontend/backend repository, each side owns its own tree: `frontend/src/tests/` and `backend/src/tests/`. Test config files stay at that project's root.

### Important: provided test cases are templates

The `.example.ts`, `.example.tsx`, and `.example` E2E files inside `src/tests/` are intentionally **not automatically executed**. Their routes, components, and app imports are unknown until an agent inspects your code. An AI agent must connect each test to the **real implementation**, rename it to `.test.ts` / `.test.tsx` / `.spec.ts`, remove all `skip`, and run it. Otherwise it must report **not tested**, not **passed**. Do not accept an empty test suite as success.

## Install in the root of an npm/React + Node/TypeScript repository

```bash
# Requires a current Node.js runtime; current Vitest guide calls for >=22.12.0.
npm install -D vitest @vitest/coverage-v8 jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D supertest @types/supertest
npm install -D @playwright/test
npx playwright install chromium
# Optional for real PostgreSQL integration (requires Docker / equivalent):
npm install -D testcontainers @testcontainers/postgresql pg @types/pg
# Recommended for Postman v12 collections (separate installed CLI):
npm install -g postman-cli
# Legacy v2.1 JSON collection runner only (no longer maintained):
npm install -D newman
```

Do not install all packages if the backend/frontend is a different stack. In a monorepo, use the existing workspace/package manager and ensure test dependencies are in the correct workspace. Don't replace your existing package.json or Vite config blindly. Merge configuration carefully; preserve aliases/plugins and TypeScript options. **React and React DOM should already be installed by your frontend application**.

## Commands once connected to the real app

```bash
npx vitest run --project frontend-unit
npx vitest run --project backend-unit
npx vitest run --project backend-integration
npx vitest run --coverage --project frontend-unit --project backend-unit
npx playwright test
npx playwright test --ui
postman collection run src/tests/postman/example-api.postman_collection.json \
  -e src/tests/postman/local.postman_environment.json
# Optional legacy runner for this exported v2.1 collection:
npx newman run src/tests/postman/example-api.postman_collection.json \
  -e src/tests/postman/local.postman_environment.json
```

`npx playwright test` requires working frontend and backend test environments. The included `playwright.config.ts` runs `npm run dev` locally by default and assumes a web app at `127.0.0.1:5173`; edit this for your app. `test:integration` with Testcontainers requires a running container runtime. Postman endpoints in the example collection must be adjusted to match your backend. **Postman CLI is recommended for v12/new v3 YAML collections; Newman is legacy (no longer maintained) and is limited to v2.1 JSON.**

### Never do these things

- Never point destructive tests at production, shared or customer databases.
- Never commit `.env.test`, tokens, session cookies, storage state, credentials, real PII, or user-generated screenshots containing PII.
- Never replace a broken assertion with `test.skip`, `expect(true).toBe(true)`, a broad `try/catch`, or a mock of the behavior you claim to test.
- Never use `waitForTimeout()` as a default synchronization strategy; wait for user-visible conditions or responses.
- Never claim CI success without showing the actual test counts/results.
- Never let an autonomous agent run unknown external URLs, execute dangerous admin actions, or touch live accounts without permission.

See `docs/security-testing.md` for the security case checklist.

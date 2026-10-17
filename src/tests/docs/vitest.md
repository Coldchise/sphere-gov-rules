# Vitest — frontend/backend unit test runner

**Belongs to:** both. **Permanent cases:** `src/tests/unit/frontend/**/*.test.tsx`, `src/tests/unit/backend/**/*.test.ts`, and runner for `src/tests/integration/backend/**/*.test.ts`.

## When to use

- Pure calculations, parsers, permission decisions, price totals, pagination validation.
- React component tests **with** React Testing Library (Vitest alone isn't the UI-query layer).
- API integration tests **with** Supertest and DB integration tests **with** Testcontainers.
- Mock clocks, noncritical third-party calls, functions; track code coverage.

**Do not** use Vitest's `jsdom` unit tests as proof that an entire web app works in a browser. Use Playwright Test for that. Note that Vitest also has a separate browser mode; this starter deliberately chooses Playwright Test for full-stack E2E.

## Install and configure

```bash
npm install -D vitest @vitest/coverage-v8 jsdom
# Current Vitest guide (checked Oct 2026) requires Node >=22.12 and Vite >=6.4.
```

Use repository-root `vitest.config.ts` shipped with this guide. It defines three named `projects`: `frontend-unit` (jsdom), `backend-unit` (node), `backend-integration` (node). Current Vitest uses `test.projects`; older `workspace` setup is deprecated. Merge with existing config rather than replace it. If your React app requires Vite/React transforms and aliases, preserve its existing plugin settings.

In existing `package.json`, merge sample scripts from `package.testing.scripts.example.json`.

```bash
npx vitest run --project frontend-unit
npx vitest run --project backend-unit
npx vitest run --project backend-integration
npx vitest run src/tests/unit/backend/calculate-total.test.ts
npx vitest run --coverage --project frontend-unit --project backend-unit
```

### Real backend example (adapt import)

File: `src/tests/unit/backend/calculate-total.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { calculateTotal } from '../../../domain/calculate-total'; // verify actual path!

describe('calculateTotal', () => {
  it.each([
    { price: 100, quantity: 2, total: 200 },
    { price: 0, quantity: 10, total: 0 },
    { price: 49.5, quantity: 2, total: 99 },
  ])('returns $total for $price × $quantity', ({ price, quantity, total }) => {
    expect(calculateTotal(price, quantity)).toBe(total);
  });
  it('rejects a negative quantity', () => {
    expect(() => calculateTotal(100, -1)).toThrow();
  });
});
```

This assumes the function explicitly rejects negatives; **inspect the real contract first**. If the app returns validation results rather than throwing, assert that instead. Financial amounts should often be integer minor currency units to avoid floating-point ambiguity.

## Good mocking policy

```ts
import { expect, it, vi } from 'vitest';

it('sends a notification once after success', async () => {
  const sendMail = vi.fn().mockResolvedValue(undefined);
  // Call real service with an injected sendMail boundary.
  // await createAccount({ email: 'tester@example.test' }, { sendMail, repository });
  // expect(sendMail).toHaveBeenCalledTimes(1);
});
```

Mock email/network for fast unit tests; do **not** mock the business function itself. For security policy, test denial and allow behavior against the real policy. Test error and boundary branches, not only success.

## Test quality and coverage

- Use `describe`, `it`, `expect`, `vi` imported from Vitest; no need to enable globals.
- `beforeEach` resets per-test state; restore fake timers and spies.
- Avoid `it.skip`, `.only`, `waitForTimeout`, brittle snapshots and arbitrary CI sleeps.
- Prefer type-safe fixtures; avoid `any` to sidestep errors.
- Use V8 coverage provider and keep coverage focused on app source rather than test files, configuration files, or generated code.
- A coverage percentage cannot replace RBAC, injection, tenant-isolation, or real DB assertions.

## Troubleshooting

- `No test files found`: files are still `.example.ts` or paths/config differ; this is **not** success.
- `document is not defined`: frontend project must use `environment: 'jsdom'`.
- JSX transform issue: inspect your app's Vite/React plugin and TS settings; do not randomly rewrite imports.
- Testcontainers timeout: run with Docker ready; do not disable test to get green.

**Official references:** https://vitest.dev/guide/ , https://vitest.dev/guide/projects , https://vitest.dev/guide/coverage

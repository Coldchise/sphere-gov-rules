# Playwright Test — permanent full-stack browser E2E

**Belongs to:** full stack; files live in `src/tests/e2e/`, because flows cross frontend+backend. The browser talks to the real running frontend and preferably a real disposable backend/test DB. **This is the primary E2E runner**, not Selenium, MCP, or the agent CLI.

## When to use

- Login/logout, protected routes, create/edit/delete a record, report search, pagination, bulk edit, upload, role-based navigation.
- Browser-only issues: real focus/keyboard, sticky header, mobile viewport, navigation, cookies, cross-browser behavior.
- A small number of valuable, stable user journeys at merge/release time.

Use RTL unit tests for most UI variations because they are faster and easier to debug. Don't duplicate hundreds of trivial component assertions in E2E.

## Install

```bash
npm install -D @playwright/test
npx playwright install chromium
# Optionally: npx playwright install --with-deps   # Linux system browser dependencies
```

Use root `playwright.config.ts`: `testDir: './src/tests/e2e'`, default Chromium, base URL `127.0.0.1:5173`, trace/video/screenshots retained only on failure. Edit `webServer.command` to use your actual frontend startup and configure backend startup separately if needed. If you have an existing test server, set `E2E_BASE_URL` and start services yourself.

```bash
npx playwright test
npx playwright test --project chromium
npx playwright test --headed
npx playwright test --ui
npx playwright show-report
```

### Browser example (adapt routes/selectors/test accounts)

```ts
import { test, expect } from '@playwright/test';

test('visitor cannot open the admin page', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/login|forbidden/);
});

test('login shows an error without exposing credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill('missing@example.test');
  await page.getByLabel(/password/i).fill('invalid-test-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('alert')).toContainText(/invalid|incorrect|unable/i);
  await expect(page.locator('body')).not.toContainText('invalid-test-password');
});
```

Adjust expected UI and status to actual behavior; **the regex is illustrative, not a substitute for a precise contract**. Real tests should create a scoped account via a test-only setup fixture or API using injected secrets.

### Data Table case

1. Navigate to Employees list. Assert sidebar/header/table column headers exist.
2. Set a search term. Assert query sent or result list updates correctly.
3. Trigger next page. Assert skeleton is **only inside rows** and table header remains.
4. Assert the correct page and previous/next state; test handling of stale responses.
5. Confirm unauthorized users cannot access data from API too (Supertest).

### Data Grid case

1. Open inventory edit page as authorized test user.
2. Focus a cell and enter a valid change; commit and wait for saved indicator.
3. Reload page to confirm backend persistence, not only UI state.
4. Attempt invalid change; expect user-readable validation and no corrupt save.
5. Attempt without edit permission; both UI and API should deny.

## Reliable locators and waiting

- Prefer `page.getByRole('button', { name: 'Save' })`, `getByLabel`, `getByText` to deeply nested CSS/XPath.
- Use Playwright `expect(locator).toBeVisible()` auto-retry; avoid `page.waitForTimeout()` and fixed sleeps.
- Isolate sessions per test; clean test DB records; use distinct user accounts for parallel tests.
- Use `trace: 'retain-on-failure'`, not always-on heavy traces. Screenshots/videos can contain PII: scrub/redact and control CI artifact access.
- Browser projects can include Chromium, Firefox and WebKit later as the team needs; do not triple suite time without clear risk value.
- Avoid brittle assertions on auto-generated timestamps or animation. Assert stable user outcomes.

## Security and agent safety

No real passwords, production auth cookies, real users, arbitrary external navigation or unapproved destructive admin tasks. Backend API permission tests are mandatory; hidden buttons alone are not enforcement. For E2E test accounts, load from CI secret store or create test-only users programmatically; never commit browser storage-state files.

**References:** https://playwright.dev/docs/intro , https://playwright.dev/docs/best-practices , https://playwright.dev/docs/test-webserver

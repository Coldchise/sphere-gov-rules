# Playwright Library API — programmatic browser control

**Belongs to:** full-stack browser automation. **Package:** `playwright` (browser API) or use API through `@playwright/test`. **Guide source:** https://playwright.dev/docs/api/class-playwright

## When to use

- A standalone browser script outside test runner, e.g. browser data/setup on a trusted disposable test app.
- Specialized browser instrumentation/debugging where the test runner does not fit.
- Low-level browser launch, contexts, pages, network requests and lifecycle control.

**Prefer Playwright Test for permanent tests** because it supplies assertions, retries, isolation, fixtures, reporting, tracing, and CI integration. Playwright Library API is not itself a test runner. Browser automation is not a replacement for unit/API tests.

## Setup

```bash
npm install -D playwright
npx playwright install chromium
# If using @playwright/test, you usually don't need a second runner/setup.
```

## Minimal browser script

```ts
import { chromium } from 'playwright';

async function inspectLocalApp() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext(); // isolated cookies/session
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/');
    console.log('Page title:', await page.title());
    await context.close();
  } finally {
    await browser.close();
  }
}

inspectLocalApp().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Browser script failed');
  process.exitCode = 1;
});
```

## Security

- Restrict scripts to approved local/test domains and test identities.
- Never reuse developer's personal Chrome profile, live browser session or stored cookies.
- Default to headless and a new browser context; close contexts and browser in `finally`.
- Avoid logging raw HTML, network payloads, tokens or PII. Scripts must never automatically approve payments, production deletes or account changes.
- Do not use `ignoreHTTPSErrors` as a default fix for untrusted sites.

## Agent rule

If building repeatable test case, write `src/tests/e2e/feature.spec.ts` using `@playwright/test` rather than a custom `node scripts/browser.ts` runner. Use this API only if the scope truly needs non-test scripted browser control.

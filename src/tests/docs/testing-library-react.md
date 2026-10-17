# React Testing Library — component behavior tests

**Belongs to:** frontend only. **Folder:** `src/tests/unit/frontend/`. **Runner:** Vitest (`jsdom`). It is not a test runner by itself.

## Use for

User-visible component behavior: form validation, submit, loading/error/empty state, data tables/grids, keyboard focus, disabled actions, accessible labels, conditional rendering, and user-friendly error text. Use Playwright Test when browser navigation, actual backend, cookies and DB must work together.

## Install

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`src/tests/setup/react.ts` registers jest-dom matchers for Vitest and cleanup. `vitest.config.ts` assigns it to `frontend-unit` using `jsdom`. Verify your app already has `react` and `react-dom` and the correct React/Vite JSX setup.

## Practical example: required form fields

```tsx
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateEmployeeDialog } from '../../../features/employees/CreateEmployeeDialog'; // adapt

it('shows required name error before submitting', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateEmployeeDialog open onCreate={onCreate} />);

  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(await screen.findByText(/name is required/i)).toBeVisible();
  expect(onCreate).not.toHaveBeenCalled();
});
```

Test this only if these are the actual props and text. Prefer `getByRole('button', {name:...})` / `getByLabelText` rather than `container.querySelector('.btn')`. For async state use `findBy...` or `waitFor`, not a hardcoded timeout.

## Data Table scenario: headers stay visible while rows fetch

```tsx
it('keeps search and column headers visible while loading next page', async () => {
  // Render your real EmployeesPage with an API mock that delays page 2.
  // Assert: heading/search/table column headers remain mounted.
  // Click Next. Assert a *single* row loading state; no blank full-page skeleton.
  // Resolve request. Assert only page 2 rows, and correct Next/Previous state.
});
```

## Data Grid scenario: validation and persistence

```tsx
it('does not save an invalid edited cell and gives a readable error', async () => {
  // Render the real grid with a validation-aware save boundary.
  // Focus editable Quantity cell; replace with -3; commit.
  // Assert inline error/invalid state; onSave not called; focus remains usable.
});
```

Check both real API effects and component behavior in different test levels; a mocked UI callback passing is not proof the backend saved the value.

## Recommended assertions

- `toBeVisible()`, `toHaveAccessibleName()`, `toBeDisabled()`, `toHaveValue()`, `toHaveTextContent()`.
- Normal workflows via `userEvent.setup(); await user.click(...)`, `await user.type(...)`, `await user.keyboard(...)`.
- Prefer `screen.queryByRole` to assert absence; `findByRole` to await appearance.
- Check happy, invalid, submit error, empty, retry and disabled/permission states.
- Mock **network boundary**, not the component implementation being tested. If mocking API calls, prefer an existing request-mocking layer; do not introduce MSW without approval when that changes repository dependencies.

## Accessibility + mobile caveats

jsdom cannot verify CSS layout, real keyboard focus across browsers, actual responsive breakpoints, native browser networking or full screen-reader compatibility. Use Playwright Test for a small real mobile viewport check and cross-browser E2E where appropriate. Use RTL to catch accessible-name/label problems early.

**Official references:** https://testing-library.com/docs/react-testing-library/intro/ , https://testing-library.com/docs/user-event/intro/

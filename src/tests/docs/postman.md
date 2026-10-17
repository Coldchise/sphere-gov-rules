# Postman / Newman — API collection tests

**Place in:** **BACKEND / API testing**, not frontend component tests. **Folder:** `src/tests/postman/`. The React frontend may call these endpoints, but Postman does not test buttons, React state, CSS, keyboard interaction or browser navigation.

## When to use

- Shared API collection for backend/frontend developers; endpoint examples and response contracts.
- Quick API smoke test of a local/development/staging backend after deployment.
- Manual requests during debugging; automated collection checks in CI using the **Postman CLI** (recommended). Newman can run older exported v2.1 JSON collections but is no longer maintained and does not support v3 Native Git collections.
- Verifying method, URL, status, JSON fields, auth failure and safe error contracts.

**Use Supertest** for code-level backend integration tests, custom setup, authorization, DB side effects and fast Node.js workflows. Use Postman when you want a portable team API collection or external deployed-environment smoke checks. Maintaining both for every endpoint can be redundant; reserve Postman for a small, curated collection if Supertest already covers contracts.

## Setup

1. Install Postman desktop or use its web app for editing; Postman CLI is separately installable (and may be bundled with desktop).
2. For new Postman v12 Native Git projects use **collection v3 YAML**; this starter includes an older **v2.1 JSON** export in `src/tests/postman/` for portable demonstration. Use `postman collection migrate` when adopting the v3 format.
3. Keep non-secret local environment values (e.g. local base URL) in an exported JSON file.
4. For Postman v12, install the **current Postman CLI** (recommended). The bundled example is v2.1 JSON, so you can optionally use legacy Newman for that example only:

```bash
# Recommended (supports both collection v3 YAML and v2.1 JSON):
npm install -g postman-cli
postman collection run src/tests/postman/example-api.postman_collection.json \
  -e src/tests/postman/local.postman_environment.json --bail

# Legacy v2.1 JSON runner (no longer maintained; avoid for new v12 projects):
npm install -D newman
npx newman run src/tests/postman/example-api.postman_collection.json \
  -e src/tests/postman/local.postman_environment.json --bail
```

Run only after your **own test backend** is listening at the configured `baseUrl`. The sample health and login endpoints are examples; edit to match your actual routes and expected codes. Current Postman CLI is the recommended automation tool and supports collection v3 YAML and v2.1 JSON. **Newman is no longer maintained** and supports older v2.1 JSON, not current v3 Native Git format. For brand-new Postman v12 Native Git projects, follow `postman init` and v3 setup; `postman collection migrate` can convert a v2.1 JSON collection if desired. The included JSON is intentionally v2.1 for portability and optional legacy Newman compatibility.

## Example Postman tests (Scripts → Post-response)

```js
pm.test('returns HTTP 200', () => {
  pm.response.to.have.status(200);
});

pm.test('response is JSON', () => {
  pm.response.to.have.header('Content-Type');
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

pm.test('response does not contain password hash', () => {
  const body = pm.response.json();
  pm.expect(body).not.to.have.property('passwordHash');
});
```

Prefer exact expected outcomes after documenting API behavior (e.g. 401 for no auth, 403 for insufficient role, 201 on create, 409 for duplicate according to contract). A status-only check is too weak for important endpoints; check schema/shape, safe errors and actual effects at Supertest/DB layer. Be cautious: JSON parsing only for known JSON routes.

## Typical test collection organization

```text
src/tests/postman/
  example-api.postman_collection.json  # replace example routes; tracked in Git
  local.postman_environment.json       # contains public dummy/local values only
  (private secrets NEVER committed)
```

Recommended request folders inside the collection:

```text
Auth: reject invalid login, reject missing/expired token
Users: list paginated, create validation, forbidden role, cross-tenant attempt
Health: basic service availability (only if app exposes health route)
Security: invalid IDs, large page sizes, no secrets in errors
```

## Authorization strategy

- Put `{{baseUrl}}` in environment; keep it 127.0.0.1/local test by default.
- Supply `{{testAccessToken}}` from environment at runtime/CI, never put real token in the JSON collection.
- Prefer obtaining an ephemeral test token through a test-only setup route/fixture that is disabled in production.
- Do not export collections with cookies, passwords, real auth headers or API keys.
- Keep separate unauthorized requests that deliberately send **no** token; don't allow collection-wide inherited auth to invalidate those cases.

## Security gotchas

- Never run destructive collection tests against production or an accidentally configured live URL; enforce an allowlist and fail closed for unknown base URL.
- Redact verbose request/response artifacts in CI; do not print Authorization headers or PII.
- Be careful with `newman --insecure`; never use it as default workaround for TLS certificate errors.
- Do not store collection environment secrets in Git. Check generated collection files for hardcoded tokens before commit.
- No live load testing with Newman; use controlled performance/security tooling with authorization when required.

## How an AI agent should use this

1. Read OpenAPI spec/router code and confirm actual endpoints/auth requirements.
2. Update the sample `src/tests/postman/example-api.postman_collection.json` or create a purpose-named collection using real routes.
3. Cover success + invalid + unauthorized + forbidden + safe errors with exact response checks.
4. Use only a disposable API test environment, run Postman CLI (or legacy Newman for v2.1), report pass/fail numbers; do not claim green if backend is offline.
5. Commit sanitized collection/environment; redact local artifacts.

## When to prefer what

| Question | Primary tool |
|---|---|
| Is our Express route + DB + auth correct? | Supertest (+ Testcontainers as needed) |
| Does deployed test API still match agreed contract? | Postman + Newman |
| Does browser click really submit and display result? | Playwright Test |
| Does React form show required errors? | React Testing Library |

**Official references:** https://learning.postman.com/docs/postman-cli/postman-cli-installation , https://learning.postman.com/docs/postman-cli/postman-cli-run-collection , https://learning.postman.com/docs/reference/newman-cli/migrate-to-postman-cli

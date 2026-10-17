# Testcontainers — real disposable database integration tests

**Belongs to:** backend. **Folder:** `src/tests/integration/backend/`. **Run with:** Vitest and a compatible Docker/container runtime. Testcontainers creates temporary service instances; it is NOT the database itself.

## Use it for

- SQL queries, migrations, foreign keys, uniqueness, transactions/rollback, concurrency, index behavior.
- Checking real behavior of PostgreSQL, Redis, MongoDB or other runtime dependencies **when your app uses them**.
- Detecting differences between an in-memory mock and the actual DB driver/engine.

Skip for pure functions, component tests, and every request that does not need a real external service. It costs startup time and CI resources; don't start one container per assertion.

## Prerequisites and install

1. Docker or compatible runtime installed and running; permissions configured.
2. Use synthetic data and a **disposable** container only.
3. Match the database major version to production in CI; pin the container image tag/digest as appropriate for your environment.

```bash
npm install -D vitest testcontainers @testcontainers/postgresql pg @types/pg
# Docker setup depends on OS. Check 'docker info' locally.
```

## Example that genuinely exercises PostgreSQL

Reference file provided: `src/tests/integration/backend/postgres.example.ts`. Rename it to `postgres.test.ts` to include it in the suite after Docker and packages are configured.

```ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

let pgContainer: StartedPostgreSqlContainer;
let client: Client;

beforeAll(async () => {
  pgContainer = await new PostgreSqlContainer('postgres:16-alpine').start();
  client = new Client({ connectionString: pgContainer.getConnectionUri() });
  await client.connect();
  await client.query('CREATE TABLE test_employees (email TEXT UNIQUE NOT NULL)');
}, 120_000);

afterAll(async () => {
  await client?.end();
  await pgContainer?.stop();
});

describe('Employee email uniqueness', () => {
  it('rejects two employees with the same email', async () => {
    await client.query('INSERT INTO test_employees (email) VALUES ($1)', ['a@example.test']);
    await expect(client.query('INSERT INTO test_employees (email) VALUES ($1)', ['a@example.test']))
      .rejects.toMatchObject({ code: '23505' });
  });
});
```

This is a **database demonstration**. To validate your actual app: do not substitute that handwritten `CREATE TABLE` for your app migrations. Launch the container, run **real migrations**, initialize actual ORM/repository, then assert app behavior and persisted rows.

### Isolation patterns

- Prefer `beforeAll` one container per suite/project, `afterAll` stop it, `beforeEach` truncate or rollback **test-only tables** when safe.
- Parallel tests must not share rows unpredictably; unique IDs/schema or separate databases/transactions.
- A container URI is not a production URI. Ensure test database env cannot accidentally resolve to production.
- Do not bake credentials or private customer dumps into images.
- CI: provide Docker-in-Docker/service runtime permissions only when required; beware host port collision, resource use and privileged service configurations.
- On failure: collect sanitized query/error, migrations and container logs; do not leak database password or row contents.

### Performance

Run pure tests first. Real DB tests on important backend changes/PRs. Reuse containers per suite to reduce startup costs, but never compromise isolation to save seconds. Set appropriate startup timeouts based on CI environment rather than swallowing failures.

**Official references:** https://node.testcontainers.org/ , https://node.testcontainers.org/modules/postgresql/

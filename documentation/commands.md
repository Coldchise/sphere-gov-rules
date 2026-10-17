# @coldchise/gov-rules — Commands

## Setup

```powershell
npm install            # Node.js >= 22 required
```

There is no `.env` setup: the library takes no environment configuration by design.

## Development

```powershell
npm run build          # tsup -> dist/ (ESM + CJS + type declarations)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run format         # prettier --write .
npm run test           # vitest run (backend-unit project)
npm run test:unit      # same project, explicit
npm run test:coverage  # v8 coverage with 80/75/80/80 thresholds
```

## Quality Gates (all four must pass)

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm publish` re-runs all four automatically (`prepublishOnly`) — do not publish when any gate fails.

## Verifying the package output before publishing

```powershell
npm run build
npm pack --dry-run     # inspect exactly what would be published (dist/, README, LICENSE)
node -e "const g=require('./dist/index.cjs'); console.log(g.calculateSSS(10000))"   # CJS smoke
node --input-type=module -e "import('./dist/index.js').then(g => console.log(g.calculatePagIbig(10000)))"   # ESM smoke
```

## Publishing

Releases publish from CI: `.github/workflows/publish.yml` runs when a `v*` tag is pushed
(or via manual workflow dispatch). It re-runs the four gates (`prepublishOnly`), publishes
with the `NPM_TOKEN` repository secret, and attaches npm provenance.

```bash
git tag v0.1.0
git push origin v0.1.0
```

The tag must match the `package.json` version (`v0.1.0` ↔ `0.1.0`) or the workflow fails.

Manual local publish (fallback only):

```powershell
npm run build
npm publish --access public   # scoped package; prepublishOnly gates run first
```

## Troubleshooting

- **`Cannot find module 'tsup'`** — run `npm install` first.
- **Declaration build fails after a TypeScript upgrade** — tsup generates `.d.ts`; if a TypeScript major breaks the dts pipeline, pin the previous TypeScript version in `devDependencies` until tsup supports the new major.
- **Coverage threshold failure** — the thresholds concern real source under `src/`; add behavior tests, never lower the threshold or weaken assertions.
- **A test expected value looks stale** — recompute by hand from the schedule in `documentation/architecture.md` (every expected value in the suite was hand-derived; do not copy values out of the implementation).

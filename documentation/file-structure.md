# @coldchise/gov-rules — File Structure

```text
sphere-gov-rules/
├── AGENTS.md                      # master rulebook (copy of documentation/AGENTS.md)
├── README.md                      # public package readme (npm)
├── LICENSE                        # MIT
├── government_contribution.pdf    # reference document (informational only)
├── package.json
├── tsconfig.json                  # strict TS, noEmit (tsup emits)
├── tsup.config.ts                 # dual ESM + CJS + dts build
├── vitest.config.ts               # backend-unit project (node)
├── eslint.config.js               # @eslint/js + typescript-eslint + prettier
├── .prettierrc / .prettierignore
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                 # four quality gates on pushes to main and all pull requests
│       └── publish.yml            # v* tag-triggered npm publish (NPM_TOKEN secret + npm provenance)
├── documentation/
│   ├── architecture.md            # precision model, statutory rules, module map, gaps
│   ├── commands.md                # scripts, gates, publish verification, troubleshooting
│   └── file-structure.md          # this file
└── src/
    ├── index.ts                   # calculatePhilippinePayroll pipeline + public exports
    ├── types.ts                   # public interfaces
    ├── money.ts                   # internal centavo math + validation (not exported)
    ├── sss.ts                     # MSC bracket search, 5% / 10% shares
    ├── philhealth.ts              # floor/ceiling branch + 2.5% computation
    ├── pagibig.ts                 # rate switch at ₱1,500 + ₱10,000 fund cap
    ├── tax.ts                     # BIR TRAIN monthly bracket table
    └── tests/                     # ALL tests live inside src (AGENTS.md §2.E)
        ├── README.md              # kit guide
        ├── docs/                  # agent testing manuals
        ├── fixtures/              # synthetic data only
        └── unit/backend/          # pure-calculation Vitest suites
            ├── payroll.test.ts    # benchmark cases, floors/ceilings, validation
            ├── sss.test.ts        # MSC bracket boundaries
            ├── philhealth.test.ts # floor/ceiling boundaries + rounding
            ├── pagibig.test.ts    # ₱1,500 rate switch, caps
            └── tax.test.ts        # bracket boundaries, continuity, rounding
```

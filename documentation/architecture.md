# @coldchise/gov-rules — Architecture

## 1. Purpose & Scope

Standalone npm library computing Philippine monthly statutory deductions and BIR withholding tax from a basic monthly salary: SSS, PhilHealth, Pag-IBIG (HDMF), and the TRAIN-law monthly withholding schedule. Pure, deterministic, **zero runtime dependencies**. No configuration, no I/O, no environment variables — the entire contract is the exported function signatures.

## 2. Precision Model

- All financial arithmetic is done in **integer centavos** (`src/money.ts`); percentage steps round **half-up** using integer math (`percentOfCentavos`). This satisfies the backend rulebook's financial-precision rule (§77: never raw floating-point money math) and makes results exact and identical across platforms.
- Conversion happens only at the API boundary: pesos → centavos on input (`pesosToCentavos`, one half-up rounding of the input to the nearest centavo), centavos → pesos on output (`centavosToPesos`, exact division by 100).

## 3. Statutory Rules Implemented

| Agency     | Rule                                                                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SSS        | 5% employee / 10% employer of the Monthly Salary Credit. MSC is the ₱500 bracket spanning `[MSC − ₱250.00, MSC + ₱249.99]`, floored at ₱5,000 and capped at ₱35,000. The employer EC contribution is excluded (project decision). |
| PhilHealth | 2.5% employee / 2.5% employer. Floor ₱10,000 (₱250.00/share), ceiling ₱100,000 (₱2,500.00/share); between them the share is 2.5% of salary rounded half-up to the centavo.                                                        |
| Pag-IBIG   | 1% employee for salaries ≤ ₱1,500, else 2%; 2% employer. Fund salary capped at ₱10,000; each share capped strictly at ₱200.00.                                                                                                    |
| BIR        | TRAIN-law monthly schedule (2023 onwards): tax = base amount for the bracket + marginal rate on the excess over the bracket's excess base.                                                                                        |

The written project specification is authoritative (the `government_contribution.pdf` reference in the repository is informational only, per owner decision).

## 4. Module Map

- `src/types.ts` — public interfaces (`PayrollCalculationResult`, per-agency result types).
- `src/money.ts` — internal centavo helpers: conversions, half-up integer percentage, input validation (`RangeError` on negative/non-finite).
- `src/sss.ts`, `src/philhealth.ts`, `src/pagibig.ts`, `src/tax.ts` — one agency per module. Each computes internally in centavos (`computeXCentavos`) and exposes a validated public calculator in pesos (`calculateX`).
- `src/index.ts` — the `calculatePhilippinePayroll` pipeline: contributions → taxable income (salary − total employee contributions) → withholding tax → net pay (taxable income − tax); re-exports the public API.

## 5. API Contract

- Inputs are gross monthly amounts in pesos; every public function rejects negative and non-finite inputs with a `RangeError` (fail loud — no silent fallbacks).
- `calculatePhilippinePayroll` echoes the input in `monthlySalary`; all computed amounts are centavo-exact pesos.
- Functions are pure: no mutation, no state, no side effects; identical input produces identical output.

## 6. Build & Distribution

- Bundled by **tsup** to dual formats: `dist/index.js` (ESM) + `dist/index.cjs` (CJS) with `dist/index.d.ts` / `dist/index.d.cts` declarations and source maps.
- `package.json` uses an explicit `exports` map with per-format `types` conditions; `sideEffects: false`; only `dist/` is published.
- `prepublishOnly` runs the full four-gate suite (typecheck, lint, tests, build) so a broken build can never be published.

## 7. Testing

- Vitest project `backend-unit` (node environment) per the testing kit's decision table ("pure calculation → `src/tests/unit/backend/`"): all tests live in `src/tests/unit/backend/`.
- Coverage: benchmark cases from the project spec (₱10,000 / ₱50,000 salaries), every statutory floor/ceiling, all SSS bracket edges, BIR bracket boundaries and continuity, rounding half-up cases, and input rejection.
- Coverage thresholds (80/75/80/80) are enforced via `npm run test:coverage`.

## 8. Known Constraints

- Rates and brackets are pinned to the project specification (current schedules). When BIR/SSS/PhilHealth/Pag-IBIG publish revised tables, update the constants **and** the tests in the same change.
- The employer SSS share (10%, EC excluded) is a project decision, not a statutory full employer computation.
- The library computes for one employee; multi-employee payroll orchestration is out of scope.

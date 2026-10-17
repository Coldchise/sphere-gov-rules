# @coldchise/gov-rules

Philippine payroll statutory calculations as pure, deterministic TypeScript functions.
Zero runtime dependencies. ESM + CommonJS. Strict typing.

Computes, from a monthly basic salary:

- **SSS** — 5% employee / 10% employer of the Monthly Salary Credit (₱5,000–₱35,000, ₱500 brackets)
- **PhilHealth** — 2.5% employee / 2.5% employer (₱10,000 floor, ₱100,000 ceiling)
- **Pag-IBIG (HDMF)** — 1–2% employee / 2% employer (₱10,000 fund salary cap, ₱200 per-share cap)
- **BIR withholding tax** — TRAIN-law monthly schedule (2023 onwards)
- **Net pay** — salary minus total employee contributions minus withholding tax

## Install

```bash
npm install @coldchise/gov-rules
```

## Usage

```ts
import { calculatePhilippinePayroll } from '@coldchise/gov-rules';

const payroll = calculatePhilippinePayroll(50_000);

payroll.contributions.sss; // { employee: 1750, employer: 3500, msc: 35000 }
payroll.contributions.philHealth; // { employee: 1250, employer: 1250 }
payroll.contributions.pagIbig; // { employee: 200, employer: 200 }
payroll.contributions.totalEmployeeContributions; // 3200
payroll.contributions.totalEmployerContributions; // 4950
payroll.taxableIncome; // 46800
payroll.withholdingTax; // 4568.4
payroll.netPay; // 42231.6
```

Individual calculators are exported as well:

```ts
import {
  calculateSSS,
  calculatePhilHealth,
  calculatePagIbig,
  calculateWithholdingTax,
} from '@coldchise/gov-rules';

calculateSSS(10_000); // { employeeShare: 500, employerShare: 1000, msc: 10000 }
calculatePhilHealth(10_000); // { employeeShare: 250, employerShare: 250 }
calculatePagIbig(10_000); // { employeeShare: 200, employerShare: 200 }
calculateWithholdingTax(46_800); // 4568.4
```

## API

| Function                                    | Input                            | Returns                                 |
| ------------------------------------------- | -------------------------------- | --------------------------------------- |
| `calculatePhilippinePayroll(monthlySalary)` | Gross monthly basic salary (PHP) | `PayrollCalculationResult`              |
| `calculateSSS(salary)`                      | Monthly basic salary (PHP)       | `{ employeeShare, employerShare, msc }` |
| `calculatePhilHealth(salary)`               | Monthly basic salary (PHP)       | `{ employeeShare, employerShare }`      |
| `calculatePagIbig(salary)`                  | Monthly basic salary (PHP)       | `{ employeeShare, employerShare }`      |
| `calculateWithholdingTax(taxableIncome)`    | Taxable income (PHP)             | `number`                                |

```ts
interface PayrollCalculationResult {
  monthlySalary: number;
  contributions: {
    sss: { employee: number; employer: number; msc: number };
    philHealth: { employee: number; employer: number };
    pagIbig: { employee: number; employer: number };
    totalEmployeeContributions: number;
    totalEmployerContributions: number;
  };
  taxableIncome: number;
  withholdingTax: number;
  netPay: number;
}
```

## Precision & validation

- All money is computed in **integer centavos** with half-up rounding — no floating-point money math.
- Amounts are returned in pesos (nearest centavo).
- `RangeError` is thrown for negative or non-finite inputs; there are no silent fallbacks.
- Functions are pure and deterministic: same input, same output, no side effects.

## Contribution schedules

| Agency         | Employee                  | Employer                 | Floor / ceiling                             |
| -------------- | ------------------------- | ------------------------ | ------------------------------------------- |
| SSS (RA 11199) | 5% of MSC                 | 10% of MSC (EC excluded) | MSC ₱5,000–₱35,000, ₱500 brackets           |
| PhilHealth     | 2.5%                      | 2.5%                     | ₱10,000 floor / ₱100,000 ceiling            |
| Pag-IBIG       | 1% up to ₱1,500; 2% above | 2%                       | ₱10,000 fund salary cap; ₱200 cap per share |

BIR monthly withholding (TRAIN law, 2023 onwards) after employee contributions:

| Taxable income            | Tax                                          |
| ------------------------- | -------------------------------------------- |
| ≤ ₱20,833.00              | ₱0.00                                        |
| ₱20,833.01 – ₱33,333.00   | 15% of excess over ₱20,833.00                |
| ₱33,333.01 – ₱66,667.00   | ₱1,875.00 + 20% of excess over ₱33,333.00    |
| ₱66,667.01 – ₱166,667.00  | ₱8,541.80 + 25% of excess over ₱66,667.00    |
| ₱166,667.01 – ₱666,667.00 | ₱33,541.80 + 30% of excess over ₱166,667.00  |
| Over ₱666,667.00          | ₱183,541.80 + 35% of excess over ₱666,667.00 |

## Development

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest run
npm run build       # tsup → dist/ (ESM + CJS + d.ts)
npm run test:coverage
```

All four gates (typecheck, lint, tests, build) run automatically on `npm publish` via
`prepublishOnly`.

## License

MIT © Christian Vergara

import { assertValidAmount, centavosToPesos, percentOfCentavos, pesosToCentavos } from './money';
import type { SssResult } from './types';

// RA 11199 schedule: 5% employee + 10% employer of the Monthly Salary Credit (MSC).
// The employer's EC contribution is intentionally excluded from employerShare.
const EMPLOYEE_RATE_PERCENT = 5;
const EMPLOYER_RATE_PERCENT = 10;
const MSC_FLOOR_PESOS = 5_000;
const MSC_CEILING_PESOS = 35_000;
const MSC_STEP_PESOS = 500;
// A ₱500 MSC bracket spans [MSC - ₱250.00, MSC + ₱249.99]; the excess of ₱249.99
// is 24,999 centavos, which is why the bracket search subtracts 24,999 first.
const BRACKET_HALF_STEP_MINUS_ONE_CENTAVO = 24_999;

export interface SssCentavosResult {
  employeeShare: number;
  employerShare: number;
  mscCentavos: number;
}

function mscForSalaryCentavos(salaryCentavos: number): number {
  const normalizedCentavos = salaryCentavos - BRACKET_HALF_STEP_MINUS_ONE_CENTAVO;
  const steps = Math.ceil(normalizedCentavos / (MSC_STEP_PESOS * 100));
  const msc = steps * MSC_STEP_PESOS * 100;
  return Math.min(Math.max(msc, MSC_FLOOR_PESOS * 100), MSC_CEILING_PESOS * 100);
}

export function computeSssCentavos(salaryCentavos: number): SssCentavosResult {
  const mscCentavos = mscForSalaryCentavos(salaryCentavos);
  return {
    employeeShare: percentOfCentavos(mscCentavos, EMPLOYEE_RATE_PERCENT),
    employerShare: percentOfCentavos(mscCentavos, EMPLOYER_RATE_PERCENT),
    mscCentavos,
  };
}

export function calculateSSS(salary: number): SssResult {
  assertValidAmount(salary, 'Monthly salary');
  const result = computeSssCentavos(pesosToCentavos(salary));
  return {
    employeeShare: centavosToPesos(result.employeeShare),
    employerShare: centavosToPesos(result.employerShare),
    msc: centavosToPesos(result.mscCentavos),
  };
}

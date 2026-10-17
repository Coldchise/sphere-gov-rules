import { assertValidAmount, centavosToPesos, percentOfCentavos, pesosToCentavos } from './money';
import type { PagIbigResult } from './types';

// HDMF (Pag-IBIG) schedule: 2% employee / 2% employer of the fund salary, capped at a
// ₱10,000 fund salary (₱200.00 per share). Salaries up to ₱1,500 use the 1% employee rate.
const LOW_SALARY_THRESHOLD_PESOS = 1_500;
const LOW_SALARY_EMPLOYEE_RATE_PERCENT = 1;
const STANDARD_EMPLOYEE_RATE_PERCENT = 2;
const EMPLOYER_RATE_PERCENT = 2;
const MAX_FUND_SALARY_PESOS = 10_000;
const MAX_SHARE_CENTAVOS = 20_000; // ₱200.00 monthly cap per share

export interface PagIbigCentavosResult {
  employeeShare: number;
  employerShare: number;
}

export function computePagIbigCentavos(salaryCentavos: number): PagIbigCentavosResult {
  const fundSalaryCentavos = Math.min(salaryCentavos, MAX_FUND_SALARY_PESOS * 100);
  const employeeRate =
    salaryCentavos <= LOW_SALARY_THRESHOLD_PESOS * 100
      ? LOW_SALARY_EMPLOYEE_RATE_PERCENT
      : STANDARD_EMPLOYEE_RATE_PERCENT;
  return {
    employeeShare: Math.min(
      percentOfCentavos(fundSalaryCentavos, employeeRate),
      MAX_SHARE_CENTAVOS,
    ),
    employerShare: Math.min(
      percentOfCentavos(fundSalaryCentavos, EMPLOYER_RATE_PERCENT),
      MAX_SHARE_CENTAVOS,
    ),
  };
}

export function calculatePagIbig(salary: number): PagIbigResult {
  assertValidAmount(salary, 'Monthly salary');
  const result = computePagIbigCentavos(pesosToCentavos(salary));
  return {
    employeeShare: centavosToPesos(result.employeeShare),
    employerShare: centavosToPesos(result.employerShare),
  };
}

import { assertValidAmount, centavosToPesos, percentOfCentavos, pesosToCentavos } from './money';
import type { PhilHealthResult } from './types';

// PhilHealth schedule: 5% of monthly basic salary split equally (2.5% each), with a
// ₱10,000 floor (₱250.00 per share) and a ₱100,000 ceiling (₱2,500.00 per share).
const EMPLOYEE_RATE_NUMERATOR = 25;
const RATE_DENOMINATOR = 1_000; // 25 / 1000 = 2.5%
const FLOOR_SALARY_PESOS = 10_000;
const CEILING_SALARY_PESOS = 100_000;
const FLOOR_SHARE_CENTAVOS = 25_000; // ₱250.00
const CEILING_SHARE_CENTAVOS = 250_000; // ₱2,500.00

export interface PhilHealthCentavosResult {
  employeeShare: number;
  employerShare: number;
}

export function computePhilHealthCentavos(salaryCentavos: number): PhilHealthCentavosResult {
  if (salaryCentavos <= FLOOR_SALARY_PESOS * 100) {
    return { employeeShare: FLOOR_SHARE_CENTAVOS, employerShare: FLOOR_SHARE_CENTAVOS };
  }
  if (salaryCentavos >= CEILING_SALARY_PESOS * 100) {
    return { employeeShare: CEILING_SHARE_CENTAVOS, employerShare: CEILING_SHARE_CENTAVOS };
  }
  const employeeShare = percentOfCentavos(
    salaryCentavos,
    EMPLOYEE_RATE_NUMERATOR,
    RATE_DENOMINATOR,
  );
  return { employeeShare, employerShare: employeeShare };
}

export function calculatePhilHealth(salary: number): PhilHealthResult {
  assertValidAmount(salary, 'Monthly salary');
  const result = computePhilHealthCentavos(pesosToCentavos(salary));
  return {
    employeeShare: centavosToPesos(result.employeeShare),
    employerShare: centavosToPesos(result.employerShare),
  };
}

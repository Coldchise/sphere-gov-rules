import { assertValidAmount, centavosToPesos, pesosToCentavos } from './money';
import { computePagIbigCentavos } from './pagibig';
import { computePhilHealthCentavos } from './philhealth';
import { computeSssCentavos } from './sss';
import { computeWithholdingTaxCentavos } from './tax';
import type { PayrollCalculationResult } from './types';

export { calculatePagIbig } from './pagibig';
export { calculatePhilHealth } from './philhealth';
export { calculateSSS } from './sss';
export { calculateWithholdingTax } from './tax';
export type {
  PagIbigResult,
  PayrollCalculationResult,
  PayrollContributions,
  PhilHealthResult,
  SssResult,
} from './types';

/**
 * Computes the full monthly payroll picture for a basic salary: statutory employee and
 * employer contributions (SSS, PhilHealth, Pag-IBIG), taxable income, BIR withholding
 * tax, and net pay. Contributions are deducted from the gross salary to derive taxable
 * income; net pay is taxable income minus withholding tax.
 */
export function calculatePhilippinePayroll(monthlySalary: number): PayrollCalculationResult {
  assertValidAmount(monthlySalary, 'Monthly salary');

  const salaryCentavos = pesosToCentavos(monthlySalary);
  const sss = computeSssCentavos(salaryCentavos);
  const philHealth = computePhilHealthCentavos(salaryCentavos);
  const pagIbig = computePagIbigCentavos(salaryCentavos);

  const totalEmployeeCentavos =
    sss.employeeShare + philHealth.employeeShare + pagIbig.employeeShare;
  const totalEmployerCentavos =
    sss.employerShare + philHealth.employerShare + pagIbig.employerShare;
  const taxableIncomeCentavos = salaryCentavos - totalEmployeeCentavos;
  const withholdingTaxCentavos = computeWithholdingTaxCentavos(taxableIncomeCentavos);
  const netPayCentavos = taxableIncomeCentavos - withholdingTaxCentavos;

  return {
    monthlySalary,
    contributions: {
      sss: {
        employee: centavosToPesos(sss.employeeShare),
        employer: centavosToPesos(sss.employerShare),
        msc: centavosToPesos(sss.mscCentavos),
      },
      philHealth: {
        employee: centavosToPesos(philHealth.employeeShare),
        employer: centavosToPesos(philHealth.employerShare),
      },
      pagIbig: {
        employee: centavosToPesos(pagIbig.employeeShare),
        employer: centavosToPesos(pagIbig.employerShare),
      },
      totalEmployeeContributions: centavosToPesos(totalEmployeeCentavos),
      totalEmployerContributions: centavosToPesos(totalEmployerCentavos),
    },
    taxableIncome: centavosToPesos(taxableIncomeCentavos),
    withholdingTax: centavosToPesos(withholdingTaxCentavos),
    netPay: centavosToPesos(netPayCentavos),
  };
}

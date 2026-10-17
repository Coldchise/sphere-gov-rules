/** All monetary amounts are Philippine pesos (PHP), rounded to the nearest centavo. */

export interface SssResult {
  employeeShare: number;
  employerShare: number;
  msc: number;
}

export interface PhilHealthResult {
  employeeShare: number;
  employerShare: number;
}

export interface PagIbigResult {
  employeeShare: number;
  employerShare: number;
}

export interface PayrollContributions {
  sss: { employee: number; employer: number; msc: number };
  philHealth: { employee: number; employer: number };
  pagIbig: { employee: number; employer: number };
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
}

export interface PayrollCalculationResult {
  monthlySalary: number;
  contributions: PayrollContributions;
  taxableIncome: number;
  withholdingTax: number;
  netPay: number;
}

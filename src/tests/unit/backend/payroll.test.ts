import { describe, expect, it } from 'vitest';
import { calculatePhilippinePayroll } from '../../../index';

describe('calculatePhilippinePayroll', () => {
  it('matches the benchmark result for a ₱10,000.00 monthly salary', () => {
    const result = calculatePhilippinePayroll(10_000);

    expect(result.monthlySalary).toBe(10_000);
    expect(result.contributions.sss).toEqual({ employee: 500, employer: 1_000, msc: 10_000 });
    expect(result.contributions.philHealth).toEqual({ employee: 250, employer: 250 });
    expect(result.contributions.pagIbig).toEqual({ employee: 200, employer: 200 });
    expect(result.contributions.totalEmployeeContributions).toBe(950);
    expect(result.contributions.totalEmployerContributions).toBe(1_450);
    expect(result.taxableIncome).toBe(9_050);
    expect(result.withholdingTax).toBe(0);
    expect(result.netPay).toBe(9_050);
  });

  it('matches the benchmark result for a ₱50,000.00 monthly salary', () => {
    const result = calculatePhilippinePayroll(50_000);

    expect(result.monthlySalary).toBe(50_000);
    expect(result.contributions.sss).toEqual({ employee: 1_750, employer: 3_500, msc: 35_000 });
    expect(result.contributions.philHealth).toEqual({ employee: 1_250, employer: 1_250 });
    expect(result.contributions.pagIbig).toEqual({ employee: 200, employer: 200 });
    expect(result.contributions.totalEmployeeContributions).toBe(3_200);
    expect(result.contributions.totalEmployerContributions).toBe(4_950);
    expect(result.taxableIncome).toBe(46_800);
    expect(result.withholdingTax).toBe(4_568.4);
    expect(result.netPay).toBe(42_231.6);
  });

  it('applies every statutory floor for a minimum ₱1,000.00 salary', () => {
    const result = calculatePhilippinePayroll(1_000);

    expect(result.contributions.sss).toEqual({ employee: 250, employer: 500, msc: 5_000 });
    expect(result.contributions.philHealth).toEqual({ employee: 250, employer: 250 });
    expect(result.contributions.pagIbig).toEqual({ employee: 10, employer: 20 });
    expect(result.contributions.totalEmployeeContributions).toBe(510);
    expect(result.contributions.totalEmployerContributions).toBe(770);
    expect(result.taxableIncome).toBe(490);
    expect(result.withholdingTax).toBe(0);
    expect(result.netPay).toBe(490);
  });

  it('applies every statutory ceiling for a ₱500,000.00 salary', () => {
    const result = calculatePhilippinePayroll(500_000);

    expect(result.contributions.sss).toEqual({ employee: 1_750, employer: 3_500, msc: 35_000 });
    expect(result.contributions.philHealth).toEqual({ employee: 2_500, employer: 2_500 });
    expect(result.contributions.pagIbig).toEqual({ employee: 200, employer: 200 });
    expect(result.contributions.totalEmployeeContributions).toBe(4_450);
    expect(result.contributions.totalEmployerContributions).toBe(6_200);
    expect(result.taxableIncome).toBe(495_550);
    expect(result.withholdingTax).toBe(132_206.7);
    expect(result.netPay).toBe(363_343.3);
  });

  it('is deterministic and echoes the input salary', () => {
    const first = calculatePhilippinePayroll(12_345.67);
    const second = calculatePhilippinePayroll(12_345.67);

    expect(first).toEqual(second);
    expect(first.monthlySalary).toBe(12_345.67);
  });

  it.each([-1, -0.01, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects an invalid salary of %s',
    (salary) => {
      expect(() => calculatePhilippinePayroll(salary)).toThrow(RangeError);
    },
  );
});

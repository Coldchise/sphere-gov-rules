import { describe, expect, it } from 'vitest';
import { calculatePagIbig } from '../../../index';

describe('calculatePagIbig', () => {
  it.each([
    { salary: 0, employeeShare: 0, employerShare: 0 },
    { salary: 1_000, employeeShare: 10, employerShare: 20 },
    { salary: 1_500, employeeShare: 15, employerShare: 30 },
    { salary: 1_500.01, employeeShare: 30, employerShare: 30 },
    { salary: 1_055.55, employeeShare: 10.56, employerShare: 21.11 },
    { salary: 5_000, employeeShare: 100, employerShare: 100 },
    { salary: 10_000, employeeShare: 200, employerShare: 200 },
    { salary: 10_000.01, employeeShare: 200, employerShare: 200 },
    { salary: 50_000, employeeShare: 200, employerShare: 200 },
  ])(
    'computes ₱$employeeShare / ₱$employerShare at a ₱$salary salary',
    ({ salary, employeeShare, employerShare }) => {
      expect(calculatePagIbig(salary)).toEqual({ employeeShare, employerShare });
    },
  );

  it('switches from the 1% to the 2% employee rate only above ₱1,500.00', () => {
    expect(calculatePagIbig(1_500).employeeShare).toBe(15);
    expect(calculatePagIbig(1_500.01).employeeShare).toBe(30);
  });

  it('rejects a negative salary', () => {
    expect(() => calculatePagIbig(-1)).toThrow(RangeError);
  });
});

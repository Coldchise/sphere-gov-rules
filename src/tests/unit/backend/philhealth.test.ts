import { describe, expect, it } from 'vitest';
import { calculatePhilHealth } from '../../../index';

describe('calculatePhilHealth', () => {
  it.each([
    { salary: 0, employeeShare: 250 },
    { salary: 5_000, employeeShare: 250 },
    { salary: 9_999.99, employeeShare: 250 },
    { salary: 10_000, employeeShare: 250 },
    { salary: 10_000.2, employeeShare: 250.01 },
    { salary: 12_345.67, employeeShare: 308.64 },
    { salary: 20_000, employeeShare: 500 },
    { salary: 50_000, employeeShare: 1_250 },
    { salary: 99_999.99, employeeShare: 2_500 },
    { salary: 100_000, employeeShare: 2_500 },
    { salary: 100_000.01, employeeShare: 2_500 },
    { salary: 1_000_000, employeeShare: 2_500 },
  ])('computes a ₱$employeeShare share for a ₱$salary salary', ({ salary, employeeShare }) => {
    expect(calculatePhilHealth(salary)).toEqual({ employeeShare, employerShare: employeeShare });
  });

  it('rounds the 2.5% share half-up to the nearest centavo', () => {
    // 2.5% of ₱10,000.20 is ₱250.005 → ₱250.01 (verified above); this case pins the
    // employer/employee halves together at the same rounded centavo amount.
    expect(calculatePhilHealth(10_000.2)).toEqual({ employeeShare: 250.01, employerShare: 250.01 });
  });

  it('rejects a negative salary', () => {
    expect(() => calculatePhilHealth(-0.01)).toThrow(RangeError);
  });
});

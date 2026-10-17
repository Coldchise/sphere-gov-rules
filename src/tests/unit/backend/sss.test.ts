import { describe, expect, it } from 'vitest';
import { calculateSSS } from '../../../index';

describe('calculateSSS', () => {
  it.each([
    { salary: 0, msc: 5_000, employeeShare: 250 },
    { salary: 4_999.99, msc: 5_000, employeeShare: 250 },
    { salary: 5_000, msc: 5_000, employeeShare: 250 },
    { salary: 5_249.99, msc: 5_000, employeeShare: 250 },
    { salary: 5_250, msc: 5_500, employeeShare: 275 },
    { salary: 9_249.99, msc: 9_000, employeeShare: 450 },
    { salary: 9_250, msc: 9_500, employeeShare: 475 },
    { salary: 9_750, msc: 10_000, employeeShare: 500 },
    { salary: 10_000, msc: 10_000, employeeShare: 500 },
    { salary: 10_249.99, msc: 10_000, employeeShare: 500 },
    { salary: 10_250, msc: 10_500, employeeShare: 525 },
    { salary: 34_749.99, msc: 34_500, employeeShare: 1_725 },
    { salary: 34_750, msc: 35_000, employeeShare: 1_750 },
    { salary: 35_000, msc: 35_000, employeeShare: 1_750 },
  ])(
    'maps a ₱$salary salary to MSC ₱$msc with a ₱$employeeShare employee share',
    ({ salary, msc, employeeShare }) => {
      expect(calculateSSS(salary)).toEqual({
        employeeShare,
        employerShare: employeeShare * 2,
        msc,
      });
    },
  );

  it('clamps above the ceiling: a ₱1,000,000.00 salary stays at MSC ₱35,000.00', () => {
    expect(calculateSSS(1_000_000)).toEqual({
      employeeShare: 1_750,
      employerShare: 3_500,
      msc: 35_000,
    });
  });

  it('rejects a negative salary', () => {
    expect(() => calculateSSS(-1)).toThrow(RangeError);
  });

  it('rejects a non-finite salary', () => {
    expect(() => calculateSSS(Number.NaN)).toThrow(RangeError);
  });
});

import { describe, expect, it } from 'vitest';
import { calculateWithholdingTax } from '../../../index';

describe('calculateWithholdingTax', () => {
  it.each([
    { taxableIncome: 0, withholdingTax: 0 },
    { taxableIncome: 9_050, withholdingTax: 0 },
    { taxableIncome: 20_833, withholdingTax: 0 },
    { taxableIncome: 20_833.01, withholdingTax: 0 },
    { taxableIncome: 20_833.1, withholdingTax: 0.02 },
    { taxableIncome: 20_834, withholdingTax: 0.15 },
    { taxableIncome: 33_333, withholdingTax: 1_875 },
    { taxableIncome: 33_333.01, withholdingTax: 1_875 },
    { taxableIncome: 46_800, withholdingTax: 4_568.4 },
    { taxableIncome: 66_667, withholdingTax: 8_541.8 },
    { taxableIncome: 66_667.01, withholdingTax: 8_541.8 },
    { taxableIncome: 166_667, withholdingTax: 33_541.8 },
    { taxableIncome: 166_667.01, withholdingTax: 33_541.8 },
    { taxableIncome: 166_667.15, withholdingTax: 33_541.85 },
    { taxableIncome: 666_667, withholdingTax: 183_541.8 },
    { taxableIncome: 666_667.01, withholdingTax: 183_541.8 },
    { taxableIncome: 1_000_000, withholdingTax: 300_208.35 },
    { taxableIncome: 5_000_000, withholdingTax: 1_700_208.35 },
  ])(
    'computes ₱$withholdingTax for ₱$taxableIncome taxable income',
    ({ taxableIncome, withholdingTax }) => {
      expect(calculateWithholdingTax(taxableIncome)).toBe(withholdingTax);
    },
  );

  it('is continuous across bracket boundaries', () => {
    expect(calculateWithholdingTax(33_333)).toBe(1_875);
    expect(calculateWithholdingTax(66_667)).toBe(8_541.8);
    expect(calculateWithholdingTax(166_667)).toBe(33_541.8);
    expect(calculateWithholdingTax(666_667)).toBe(183_541.8);
  });

  it('rejects a negative taxable income', () => {
    expect(() => calculateWithholdingTax(-1)).toThrow(RangeError);
  });
});

import { assertValidAmount, centavosToPesos, percentOfCentavos, pesosToCentavos } from './money';

// BIR TRAIN-law monthly withholding schedule (effective 2023 onwards). Each bracket
// stores the tax on everything up to its floor ("excess base") plus a marginal rate
// applied to the remainder above it.
interface TaxBracket {
  excessBaseCentavos: number;
  baseTaxCentavos: number;
  marginalRatePercent: number;
}

const TAX_SCHEDULE: readonly TaxBracket[] = [
  { excessBaseCentavos: 0, baseTaxCentavos: 0, marginalRatePercent: 0 },
  // over ₱20,833.00
  { excessBaseCentavos: 2_083_300, baseTaxCentavos: 0, marginalRatePercent: 15 },
  // over ₱33,333.00
  { excessBaseCentavos: 3_333_300, baseTaxCentavos: 187_500, marginalRatePercent: 20 },
  // over ₱66,667.00
  { excessBaseCentavos: 6_666_700, baseTaxCentavos: 854_180, marginalRatePercent: 25 },
  // over ₱166,667.00
  { excessBaseCentavos: 16_666_700, baseTaxCentavos: 3_354_180, marginalRatePercent: 30 },
  // over ₱666,667.00
  { excessBaseCentavos: 66_666_700, baseTaxCentavos: 18_354_180, marginalRatePercent: 35 },
];

export function computeWithholdingTaxCentavos(taxableIncomeCentavos: number): number {
  const bracket: TaxBracket = TAX_SCHEDULE.reduce((selected, candidate) =>
    taxableIncomeCentavos > candidate.excessBaseCentavos ? candidate : selected,
  );
  const excessCentavos = taxableIncomeCentavos - bracket.excessBaseCentavos;
  return bracket.baseTaxCentavos + percentOfCentavos(excessCentavos, bracket.marginalRatePercent);
}

export function calculateWithholdingTax(taxableIncome: number): number {
  assertValidAmount(taxableIncome, 'Taxable income');
  return centavosToPesos(computeWithholdingTaxCentavos(pesosToCentavos(taxableIncome)));
}

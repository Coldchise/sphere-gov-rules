// Internal money arithmetic. All financial values are handled as integer centavos and
// every percentage step rounds half-up in integer math, so results are exact and
// deterministic — never raw floating-point money math (backend rulebook §77).

const CENTAVOS_PER_PESO = 100;

export function pesosToCentavos(amount: number): number {
  return Math.round((amount + Number.EPSILON) * CENTAVOS_PER_PESO);
}

export function centavosToPesos(centavos: number): number {
  return centavos / CENTAVOS_PER_PESO;
}

// `amount` is an integer number of centavos; the result is an integer number of
// centavos rounded half-up. `denominator` must be even (100 for integer percents,
// 1000 for the 2.5% PhilHealth rate).
export function percentOfCentavos(amount: number, numerator: number, denominator = 100): number {
  return Math.floor((amount * numerator + denominator / 2) / denominator);
}

export function assertValidAmount(amount: number, label: string): void {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`${label} must be a finite number of pesos, received ${String(amount)}.`);
  }
  if (amount < 0) {
    throw new RangeError(`${label} must not be negative, received ${String(amount)}.`);
  }
}

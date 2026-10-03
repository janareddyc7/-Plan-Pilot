/** Integer-cent arithmetic helpers. Values are never represented as floats. */
export function clampCents(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error("Money must be an integer number of cents");
  return Math.max(0, value);
}

export function roundCents(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Cannot round a non-finite amount");
  return Math.max(0, Math.round(value));
}

export function percentageOfCents(cents: number, percent: number): number {
  return roundCents(clampCents(cents) * Math.max(0, Math.min(100, percent)) / 100);
}

export function sumCents(...values: number[]): number {
  return values.reduce((sum, value) => sum + clampCents(value), 0);
}

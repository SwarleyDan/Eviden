export type MoneyResult = {
  amount: number;
  currency: "MXN";
  status: "DERIVED";
};

export function calculatePerSquareMeter(areaM2: number, rate: number): MoneyResult {
  if (!Number.isFinite(areaM2) || areaM2 < 0) {
    throw new Error("areaM2 must be a non-negative number");
  }
  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error("rate must be a non-negative number");
  }

  return {
    amount: Number((areaM2 * rate).toFixed(2)),
    currency: "MXN",
    status: "DERIVED"
  };
}

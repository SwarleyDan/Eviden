import type { MoneyResult } from "./index";
import { calculatePerSquareMeter } from "./index";

export type PachucaClassification =
  | "economic"
  | "popular"
  | "social-interest"
  | "medium-interest"
  | "residential-medium"
  | "residential-high"
  | "campestre";

type Fee = {
  id: string;
  amount: number;
  unit: "fixed" | "per_m2" | "per_lot";
  status: "VERIFIED" | "DERIVED" | "INFERRED" | "UNKNOWN" | "CONFLICT";
};

const FEES: Record<string, Fee> = {
  "alignment-official-number": { id: "alignment-official-number", amount: 158, unit: "fixed", status: "VERIFIED" },
  "completion-of-work": { id: "completion-of-work", amount: 2.67, unit: "per_m2", status: "VERIFIED" },
  "land-use-economic": { id: "land-use-economic", amount: 313, unit: "per_lot", status: "VERIFIED" },
  "land-use-popular": { id: "land-use-popular", amount: 313, unit: "per_lot", status: "VERIFIED" },
  "land-use-social-interest": { id: "land-use-social-interest", amount: 522, unit: "per_lot", status: "VERIFIED" },
  "land-use-medium-interest": { id: "land-use-medium-interest", amount: 730, unit: "per_lot", status: "VERIFIED" },
  "land-use-residential-medium": { id: "land-use-residential-medium", amount: 939, unit: "per_lot", status: "VERIFIED" },
  "land-use-residential-high": { id: "land-use-residential-high", amount: 1203, unit: "per_lot", status: "VERIFIED" },
  "land-use-campestre": { id: "land-use-campestre", amount: 939, unit: "per_lot", status: "VERIFIED" },
  "construction-social-interest": { id: "construction-social-interest", amount: 35.02, unit: "per_m2", status: "VERIFIED" },
  "construction-medium-interest": { id: "construction-medium-interest", amount: 41.2, unit: "per_m2", status: "VERIFIED" },
  "construction-residential-medium": { id: "construction-residential-medium", amount: 52.26, unit: "per_m2", status: "VERIFIED" },
  "construction-residential-high": { id: "construction-residential-high", amount: 55.62, unit: "per_m2", status: "VERIFIED" }
};

export type PachucaFeeLine = MoneyResult & {
  feeId: string;
  unit: Fee["unit"];
};

export type PachucaEstimate = {
  areaM2: number;
  classification: PachucaClassification;
  lines: PachucaFeeLine[];
  unknownFees: string[];
  totalKnown: MoneyResult;
};

function calculateFee(fee: Fee, areaM2: number): MoneyResult {
  if (fee.unit === "fixed" || fee.unit === "per_lot") {
    return { amount: fee.amount, currency: "MXN", status: "DERIVED" };
  }
  return calculatePerSquareMeter(areaM2, fee.amount);
}

export function estimatePachucaSingleFamilyNewBuild(
  areaM2: number,
  classification: PachucaClassification
): PachucaEstimate {
  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("areaM2 must be a positive number");
  }

  const feeIds = [
    "alignment-official-number",
    `land-use-${classification}`,
    `construction-${classification}`,
    "completion-of-work"
  ];

  const lines: PachucaFeeLine[] = [];
  const unknownFees: string[] = [];

  for (const id of feeIds) {
    const fee = FEES[id];
    if (!fee) {
      unknownFees.push(id);
      continue;
    }
    const result = calculateFee(fee, areaM2);
    lines.push({ ...result, feeId: id, unit: fee.unit });
  }

  const totalKnown = {
    amount: Number(lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)),
    currency: "MXN" as const,
    status: "DERIVED" as const
  };

  return { areaM2, classification, lines, unknownFees, totalKnown };
}

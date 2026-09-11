import type { MoneyResult } from "./index";
import { calculatePerSquareMeter } from "./index";
import { getPachucaFee } from "../data/pachuca-fees";

export type PachucaClassification =
  | "economic"
  | "popular"
  | "social-interest"
  | "medium-interest"
  | "residential-medium"
  | "residential-high"
  | "campestre";

export type PachucaFeeLine = MoneyResult & {
  feeId: string;
  unit: "fixed" | "per_m2" | "per_lot";
  status: "DERIVED" | "INFERRED" | "UNKNOWN" | "CONFLICT";
};

export type PachucaEstimate = {
  areaM2: number;
  classification: PachucaClassification;
  lines: PachucaFeeLine[];
  unknownFees: string[];
  totalKnown: MoneyResult;
};

function calculateFee(
  fee: NonNullable<ReturnType<typeof getPachucaFee>>,
  areaM2: number
): MoneyResult {
  if (fee.status !== "VERIFIED") {
    return {
      amount: 0,
      currency: "MXN",
      status: fee.status
    };
  }

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
    const fee = getPachucaFee(id);
    if (!fee) {
      unknownFees.push(id);
      continue;
    }

    const result = calculateFee(fee, areaM2);
    if (fee.status !== "VERIFIED") {
      unknownFees.push(id);
      continue;
    }

    lines.push({ ...result, feeId: id, unit: fee.unit, status: result.status });
  }

  const totalKnown = {
    amount: Number(lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)),
    currency: "MXN" as const,
    status: "DERIVED" as const
  };

  return { areaM2, classification, lines, unknownFees, totalKnown };
}

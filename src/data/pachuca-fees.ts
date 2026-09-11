import feesData from "../../data/pachuca/fees.json";

export type FeeStatus =
  | "VERIFIED"
  | "DERIVED"
  | "INFERRED"
  | "UNKNOWN"
  | "CONFLICT";

export type PachucaFee = {
  id: string;
  procedureId: string;
  classificationId?: string;
  amount: number;
  currency: "MXN";
  unit: "fixed" | "per_m2" | "per_lot";
  formulaType: "FIXED" | "PER_UNIT" | "TIERED" | "PERCENTAGE" | "COMPOSITE" | "CONDITIONAL";
  status: FeeStatus;
  sourceVersionIds: string[];
  notes?: string;
};

const fees = feesData.fees as PachucaFee[];

export function getPachucaFee(id: string): PachucaFee | undefined {
  return fees.find((fee) => fee.id === id);
}

export function listPachucaFees(): readonly PachucaFee[] {
  return fees;
}

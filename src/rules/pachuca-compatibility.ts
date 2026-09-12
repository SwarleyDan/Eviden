import compatibilityData from "../../data/pachuca/compatibility-rules.json";
import type { PachucaClassification } from "../calculator/pachuca";

export type PachucaCompatibilityInput = {
  classification: PachucaClassification;
  lotAreaM2: number;
  frontageM: number;
  footprintM2: number;
  totalBuiltAreaM2: number;
  levels: number;
  parkingSpaces: number;
  frontSetbackM?: number;
};

export type CompatibilityStatus = "PASS" | "FAIL" | "UNKNOWN";

export type PachucaCompatibilityCheck = {
  rule: string;
  status: CompatibilityStatus;
  actual?: number;
  required?: number;
  maximum?: number;
  unit?: string;
  reason: string;
};

export type PachucaCompatibilityEstimate = {
  status: "INFERRED";
  classification: PachucaClassification;
  cos: number;
  cus: number;
  checks: PachucaCompatibilityCheck[];
};

type CompatibilityRuleSet = {
  minimumLotAreaM2?: number;
  maximumCOS?: number;
  maximumLevels?: number;
  minimumParkingSpaces?: number;
  minimumFrontSetbackM?: number;
};

const rules = compatibilityData.classifications as Record<PachucaClassification, CompatibilityRuleSet>;

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
}

export function estimatePachucaClassificationCompatibility(
  input: PachucaCompatibilityInput
): PachucaCompatibilityEstimate {
  assertPositive(input.lotAreaM2, "lotAreaM2");
  assertPositive(input.frontageM, "frontageM");
  assertPositive(input.footprintM2, "footprintM2");
  assertPositive(input.totalBuiltAreaM2, "totalBuiltAreaM2");
  assertPositive(input.levels, "levels");
  if (!Number.isFinite(input.parkingSpaces) || input.parkingSpaces < 0) {
    throw new Error("parkingSpaces must be a non-negative number");
  }
  if (input.frontSetbackM !== undefined && (!Number.isFinite(input.frontSetbackM) || input.frontSetbackM < 0)) {
    throw new Error("frontSetbackM must be a non-negative number");
  }

  const ruleSet = rules[input.classification];
  const cos = input.footprintM2 / input.lotAreaM2;
  const cus = input.totalBuiltAreaM2 / input.lotAreaM2;
  const checks: PachucaCompatibilityCheck[] = [];

  checks.push(
    ruleSet.minimumLotAreaM2 === undefined
      ? { rule: "minimumLotArea", status: "UNKNOWN", actual: input.lotAreaM2, unit: "m²", reason: "No verified general minimum was encoded for this classification." }
      : {
          rule: "minimumLotArea",
          status: input.lotAreaM2 >= ruleSet.minimumLotAreaM2 ? "PASS" : "FAIL",
          actual: input.lotAreaM2,
          required: ruleSet.minimumLotAreaM2,
          unit: "m²",
          reason: "Compared against the verified minimum lot area for the classification."
        }
  );

  checks.push({
    rule: "minimumFrontage",
    status: "UNKNOWN",
    actual: input.frontageM,
    unit: "m",
    reason: "Frontage is captured as project input, but no verified general minimum frontage has been encoded yet."
  });

  checks.push(
    ruleSet.maximumCOS === undefined
      ? { rule: "maximumCOS", status: "UNKNOWN", actual: cos, unit: "ratio", reason: "No verified general COS limit was encoded for this classification." }
      : {
          rule: "maximumCOS",
          status: cos <= ruleSet.maximumCOS ? "PASS" : "FAIL",
          actual: Number(cos.toFixed(4)),
          maximum: ruleSet.maximumCOS,
          unit: "ratio",
          reason: "COS is derived from footprint area divided by lot area."
        }
  );

  checks.push(
    ruleSet.maximumLevels === undefined
      ? { rule: "maximumLevels", status: "UNKNOWN", actual: input.levels, unit: "levels", reason: "No verified general maximum level count was encoded for this classification." }
      : {
          rule: "maximumLevels",
          status: input.levels <= ruleSet.maximumLevels ? "PASS" : "FAIL",
          actual: input.levels,
          maximum: ruleSet.maximumLevels,
          unit: "levels",
          reason: "Compared against the verified maximum number of levels."
        }
  );

  checks.push(
    ruleSet.minimumParkingSpaces === undefined
      ? { rule: "minimumParkingSpaces", status: "UNKNOWN", actual: input.parkingSpaces, unit: "spaces", reason: "No verified general minimum parking requirement was encoded for this classification." }
      : {
          rule: "minimumParkingSpaces",
          status: input.parkingSpaces >= ruleSet.minimumParkingSpaces ? "PASS" : "FAIL",
          actual: input.parkingSpaces,
          required: ruleSet.minimumParkingSpaces,
          unit: "spaces",
          reason: "Compared against the verified minimum parking requirement."
        }
  );

  checks.push(
    ruleSet.minimumFrontSetbackM === undefined || input.frontSetbackM === undefined
      ? {
          rule: "minimumFrontSetback",
          status: "UNKNOWN",
          actual: input.frontSetbackM,
          required: ruleSet.minimumFrontSetbackM,
          unit: "m",
          reason:
            ruleSet.minimumFrontSetbackM === undefined
              ? "No verified general front setback was encoded for this classification."
              : "A verified setback exists, but the project input does not include a front setback."
        }
      : {
          rule: "minimumFrontSetback",
          status: input.frontSetbackM >= ruleSet.minimumFrontSetbackM ? "PASS" : "FAIL",
          actual: input.frontSetbackM,
          required: ruleSet.minimumFrontSetbackM,
          unit: "m",
          reason: "Compared against the verified minimum front setback."
        }
  );

  return {
    status: "INFERRED",
    classification: input.classification,
    cos: Number(cos.toFixed(4)),
    cus: Number(cus.toFixed(4)),
    checks
  };
}

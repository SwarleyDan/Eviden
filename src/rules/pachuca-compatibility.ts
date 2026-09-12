import compatibilityData from "../../data/pachuca/compatibility-rules.json";
import type { PachucaClassification } from "../calculator/pachuca";

export type PachucaCompatibilityInput = {
  classification: PachucaClassification;
  lotAreaM2?: number;
  frontageM?: number;
  footprintM2?: number;
  totalBuiltAreaM2?: number;
  levels?: number;
  parkingSpaces?: number;
  frontSetbackM?: number;
};

export type CompatibilityStatus = "PASS" | "FAIL" | "UNKNOWN";
export type CompatibilityUnknownReason = "MISSING_INPUT" | "UNVERIFIED_RULE";

export type PachucaCompatibilityCheck = {
  rule: string;
  status: CompatibilityStatus;
  actual?: number;
  required?: number;
  maximum?: number;
  unit?: string;
  reason: string;
  unknownReason?: CompatibilityUnknownReason;
};

export type PachucaCompatibilityEstimate = {
  status: "INFERRED";
  classification: PachucaClassification;
  cos?: number;
  cus?: number;
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

function assertPositive(value: number | undefined, name: string): asserts value is number {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    throw new Error(`${name} must be a positive number`);
  }
}

function assertNonNegative(value: number | undefined, name: string): asserts value is number | undefined {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new Error(`${name} must be a non-negative number`);
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
  assertNonNegative(input.parkingSpaces, "parkingSpaces");
  assertNonNegative(input.frontSetbackM, "frontSetbackM");

  const ruleSet = rules[input.classification];
  const cos = input.footprintM2 !== undefined && input.lotAreaM2 !== undefined
    ? input.footprintM2 / input.lotAreaM2
    : undefined;
  const cus = input.totalBuiltAreaM2 !== undefined && input.lotAreaM2 !== undefined
    ? input.totalBuiltAreaM2 / input.lotAreaM2
    : undefined;
  const checks: PachucaCompatibilityCheck[] = [];

  checks.push(
    input.lotAreaM2 === undefined
      ? { rule: "minimumLotArea", status: "UNKNOWN", unit: "m²", reason: "Lot area is required to evaluate this rule.", unknownReason: "MISSING_INPUT" }
      : ruleSet.minimumLotAreaM2 === undefined
        ? { rule: "minimumLotArea", status: "UNKNOWN", actual: input.lotAreaM2, unit: "m²", reason: "No verified general minimum was encoded for this classification.", unknownReason: "UNVERIFIED_RULE" }
        : {
            rule: "minimumLotArea",
            status: input.lotAreaM2 >= ruleSet.minimumLotAreaM2 ? "PASS" : "FAIL",
            actual: input.lotAreaM2,
            required: ruleSet.minimumLotAreaM2,
            unit: "m²",
            reason: "Compared against the verified minimum lot area for the classification."
          }
  );

  checks.push(
    input.frontageM === undefined
      ? { rule: "minimumFrontage", status: "UNKNOWN", unit: "m", reason: "Frontage is required to evaluate this rule.", unknownReason: "MISSING_INPUT" }
      : {
          rule: "minimumFrontage",
          status: "UNKNOWN",
          actual: input.frontageM,
          unit: "m",
          reason: "Frontage is captured as project input, but no verified general minimum frontage has been encoded yet.",
          unknownReason: "UNVERIFIED_RULE"
        }
  );

  checks.push(
    cos === undefined
      ? { rule: "maximumCOS", status: "UNKNOWN", unit: "ratio", reason: "Lot area and footprint area are required to derive COS.", unknownReason: "MISSING_INPUT" }
      : ruleSet.maximumCOS === undefined
        ? { rule: "maximumCOS", status: "UNKNOWN", actual: Number(cos.toFixed(4)), unit: "ratio", reason: "No verified general COS limit was encoded for this classification.", unknownReason: "UNVERIFIED_RULE" }
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
    input.levels === undefined
      ? { rule: "maximumLevels", status: "UNKNOWN", unit: "levels", reason: "Number of levels is required to evaluate this rule.", unknownReason: "MISSING_INPUT" }
      : ruleSet.maximumLevels === undefined
        ? { rule: "maximumLevels", status: "UNKNOWN", actual: input.levels, unit: "levels", reason: "No verified general maximum level count was encoded for this classification.", unknownReason: "UNVERIFIED_RULE" }
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
    input.parkingSpaces === undefined
      ? { rule: "minimumParkingSpaces", status: "UNKNOWN", unit: "spaces", reason: "Parking spaces are required to evaluate this rule.", unknownReason: "MISSING_INPUT" }
      : ruleSet.minimumParkingSpaces === undefined
        ? { rule: "minimumParkingSpaces", status: "UNKNOWN", actual: input.parkingSpaces, unit: "spaces", reason: "No verified general minimum parking requirement was encoded for this classification.", unknownReason: "UNVERIFIED_RULE" }
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
    ruleSet.minimumFrontSetbackM === undefined
      ? {
          rule: "minimumFrontSetback",
          status: "UNKNOWN",
          actual: input.frontSetbackM,
          unit: "m",
          reason: "No verified general front setback was encoded for this classification.",
          unknownReason: "UNVERIFIED_RULE"
        }
      : input.frontSetbackM === undefined
        ? {
            rule: "minimumFrontSetback",
            status: "UNKNOWN",
            required: ruleSet.minimumFrontSetbackM,
            unit: "m",
            reason: "A verified setback exists, but the project input does not include a front setback.",
            unknownReason: "MISSING_INPUT"
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
    cos: cos === undefined ? undefined : Number(cos.toFixed(4)),
    cus: cus === undefined ? undefined : Number(cus.toFixed(4)),
    checks
  };
}

import {
  estimatePachucaSingleFamilyNewBuild,
  type PachucaClassification,
  type PachucaEstimate
} from "../calculator/pachuca";
import {
  evaluatePachucaSingleFamilyNewBuildRequirements,
  type PachucaRuleInput,
  type RequirementDecision
} from "../rules/pachuca";
import {
  estimatePachucaClassificationCompatibility,
  type PachucaCompatibilityInput,
  type PachucaCompatibilityEstimate
} from "../rules/pachuca-compatibility";

export type PachucaDiagnosticInput = {
  areaM2: number;
  classification: PachucaClassification;
  isNewBuild: boolean;
  lotAreaM2?: number;
  frontageM?: number;
  footprintM2?: number;
  totalBuiltAreaM2?: number;
  levels?: number;
  parkingSpaces?: number;
  frontSetbackM?: number;
  isInRiskZone?: boolean;
  isInHistoricCenter?: boolean;
  modifiesSidewalk?: boolean;
  hasNeighborhoodAssociation?: boolean;
};

export type DiagnosticReviewFlag =
  | "REQUIREMENTS_NEED_CHECK"
  | "COMPATIBILITY_NEEDS_CHECK"
  | "INFERRED_COMPATIBILITY"
  | "UNKNOWN_FEES";

export type PachucaDiagnostic = {
  jurisdictionId: "mx-hgo-pachuca";
  project: {
    type: "single-family-new-build";
    areaM2: number;
    classification: PachucaClassification;
  };
  estimate: PachucaEstimate;
  requirements: RequirementDecision[];
  compatibility?: PachucaCompatibilityEstimate;
  reviewFlags: DiagnosticReviewFlag[];
};

function hasCompatibilityInputs(input: PachucaDiagnosticInput): input is PachucaDiagnosticInput &
  Required<Pick<PachucaCompatibilityInput, "lotAreaM2" | "frontageM" | "footprintM2" | "totalBuiltAreaM2" | "levels" | "parkingSpaces">> {
  return (
    input.lotAreaM2 !== undefined &&
    input.frontageM !== undefined &&
    input.footprintM2 !== undefined &&
    input.totalBuiltAreaM2 !== undefined &&
    input.levels !== undefined &&
    input.parkingSpaces !== undefined
  );
}

export function diagnosePachucaSingleFamilyNewBuild(
  input: PachucaDiagnosticInput
): PachucaDiagnostic {
  if (!input.isNewBuild) {
    throw new Error("The current MVP diagnostic only supports obra nueva");
  }

  const estimate = estimatePachucaSingleFamilyNewBuild(input.areaM2, input.classification);
  const requirements = evaluatePachucaSingleFamilyNewBuildRequirements({
    isNewBuild: input.isNewBuild,
    isInRiskZone: input.isInRiskZone,
    isInHistoricCenter: input.isInHistoricCenter,
    modifiesSidewalk: input.modifiesSidewalk,
    hasNeighborhoodAssociation: input.hasNeighborhoodAssociation
  } satisfies PachucaRuleInput);

  const compatibility = hasCompatibilityInputs(input)
    ? estimatePachucaClassificationCompatibility({
        classification: input.classification,
        lotAreaM2: input.lotAreaM2,
        frontageM: input.frontageM,
        footprintM2: input.footprintM2,
        totalBuiltAreaM2: input.totalBuiltAreaM2,
        levels: input.levels,
        parkingSpaces: input.parkingSpaces,
        frontSetbackM: input.frontSetbackM
      })
    : undefined;

  const reviewFlags = new Set<DiagnosticReviewFlag>();

  if (requirements.some((requirement) => requirement.status === "NEEDS_CHECK")) {
    reviewFlags.add("REQUIREMENTS_NEED_CHECK");
  }
  if (estimate.unknownFees.length > 0) {
    reviewFlags.add("UNKNOWN_FEES");
  }
  if (compatibility) {
    reviewFlags.add("INFERRED_COMPATIBILITY");
    if (compatibility.checks.some((check) => check.status === "UNKNOWN")) {
      reviewFlags.add("COMPATIBILITY_NEEDS_CHECK");
    }
  }

  return {
    jurisdictionId: "mx-hgo-pachuca",
    project: {
      type: "single-family-new-build",
      areaM2: input.areaM2,
      classification: input.classification
    },
    estimate,
    requirements,
    compatibility,
    reviewFlags: [...reviewFlags]
  };
}

import { estimatePachucaSingleFamilyNewBuild, type PachucaClassification, type PachucaEstimate } from "../calculator/pachuca";
import { evaluatePachucaSingleFamilyNewBuildRequirements, type PachucaRuleInput, type RequirementDecision } from "./pachuca";
import { estimatePachucaClassificationCompatibility, type PachucaCompatibilityInput, type PachucaCompatibilityEstimate } from "./pachuca-compatibility";
import { resolvePachucaSourceVersion } from "../data/pachuca-sources";

export type PachucaDiagnosticInput = PachucaRuleInput & {
  areaM2: number;
  classification: PachucaClassification;
  lotAreaM2?: number;
  frontageM?: number;
  footprintM2?: number;
  totalBuiltAreaM2?: number;
  levels?: number;
  parkingSpaces?: number;
  frontSetbackM?: number;
};

export type PachucaDiagnostic = {
  jurisdiction: "mx-hgo-pachuca";
  projectType: "single-family-new-build";
  costs: PachucaEstimate;
  requirements: RequirementDecision[];
  compatibility?: PachucaCompatibilityEstimate;
  missingInputs: string[];
  reviewFlags: string[];
  sourceVersionIds: string[];
};

export function diagnosePachucaSingleFamilyNewBuild(
  input: PachucaDiagnosticInput
): PachucaDiagnostic {
  const costs = estimatePachucaSingleFamilyNewBuild(input.areaM2, input.classification);
  const requirements = evaluatePachucaSingleFamilyNewBuildRequirements(input);
  const missingInputs: string[] = [];
  const reviewFlags: string[] = [];

  const compatibilityFields = [
    input.lotAreaM2,
    input.frontageM,
    input.footprintM2,
    input.totalBuiltAreaM2,
    input.levels,
    input.parkingSpaces
  ];

  let compatibility: PachucaCompatibilityEstimate | undefined;
  if (compatibilityFields.every((value) => value !== undefined)) {
    compatibility = estimatePachucaClassificationCompatibility({
      classification: input.classification,
      lotAreaM2: input.lotAreaM2!,
      frontageM: input.frontageM!,
      footprintM2: input.footprintM2!,
      totalBuiltAreaM2: input.totalBuiltAreaM2!,
      levels: input.levels!,
      parkingSpaces: input.parkingSpaces!,
      frontSetbackM: input.frontSetbackM
    });
  } else {
    missingInputs.push("lotAreaM2", "frontageM", "footprintM2", "totalBuiltAreaM2", "levels", "parkingSpaces");
    reviewFlags.push("COMPATIBILITY_NOT_EVALUATED");
  }

  if (costs.unknownFees.length > 0) reviewFlags.push("UNKNOWN_FEES");
  if (requirements.some((item) => item.status === "NEEDS_CHECK")) reviewFlags.push("CONDITIONAL_REQUIREMENTS_NEED_CHECK");
  if (compatibility?.checks.some((item) => item.status === "UNKNOWN")) reviewFlags.push("COMPATIBILITY_HAS_UNKNOWN_CHECKS");

  const sourceVersionIds = new Set<string>();
  for (const line of costs.lines) {
    for (const id of line.sourceVersionIds) sourceVersionIds.add(id);
  }
  for (const item of requirements) {
    for (const id of item.sourceVersionIds) sourceVersionIds.add(id);
  }

  for (const id of sourceVersionIds) {
    const resolved = resolvePachucaSourceVersion(id);
    if (!resolved) reviewFlags.push(`UNRESOLVED_SOURCE_VERSION:${id}`);
    else if (resolved.version.status === "PENDING_SCOPE_REVIEW") reviewFlags.push(`PENDING_SOURCE_SCOPE:${id}`);
  }

  return {
    jurisdiction: "mx-hgo-pachuca",
    projectType: "single-family-new-build",
    costs,
    requirements,
    compatibility,
    missingInputs: [...new Set(missingInputs)],
    reviewFlags: [...new Set(reviewFlags)],
    sourceVersionIds: [...sourceVersionIds]
  };
}

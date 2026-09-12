import {
  analyzePachucaClassificationCandidates,
  type PachucaClassificationAnalysis
} from "./pachuca-classification";
import {
  evaluatePachucaSingleFamilyNewBuildRequirements,
  type PachucaRuleInput,
  type RequirementDecision
} from "./pachuca";
import { resolvePachucaSourceVersion } from "../data/pachuca-sources";
import type { PachucaCompatibilityInput } from "./pachuca-compatibility";

export type PachucaUnknownClassificationDiagnosticInput = PachucaRuleInput &
  Omit<PachucaCompatibilityInput, "classification">;

export type PachucaUnknownClassificationDiagnostic = {
  jurisdiction: "mx-hgo-pachuca";
  projectType: "single-family-new-build";
  classification: PachucaClassificationAnalysis;
  requirements: RequirementDecision[];
  missingInputs: string[];
  reviewFlags: string[];
  sourceVersionIds: string[];
};

const GEOMETRY_FIELDS: Array<keyof Omit<PachucaCompatibilityInput, "classification">> = [
  "lotAreaM2",
  "frontageM",
  "footprintM2",
  "totalBuiltAreaM2",
  "levels",
  "parkingSpaces"
];

const CLASSIFICATION_SOURCE_VERSION_ID = "source-version-human-settlements-regulation-2015-05-18";

export function diagnosePachucaSingleFamilyNewBuildWithoutClassification(
  input: PachucaUnknownClassificationDiagnosticInput
): PachucaUnknownClassificationDiagnostic {
  const missingInputs = GEOMETRY_FIELDS.filter((field) => input[field] === undefined).map(String);
  if (missingInputs.length > 0) {
    return {
      jurisdiction: "mx-hgo-pachuca",
      projectType: "single-family-new-build",
      classification: {
        status: "INFERRED",
        candidates: [],
        compatibleClassifications: [],
        incompatibleClassifications: [],
        indeterminateClassifications: []
      },
      requirements: evaluatePachucaSingleFamilyNewBuildRequirements(input),
      missingInputs,
      reviewFlags: ["CLASSIFICATION_NOT_EVALUATED", "CLASSIFICATION_GEOMETRY_INCOMPLETE"],
      sourceVersionIds: [CLASSIFICATION_SOURCE_VERSION_ID]
    };
  }

  const classification = analyzePachucaClassificationCandidates({
    lotAreaM2: input.lotAreaM2!,
    frontageM: input.frontageM!,
    footprintM2: input.footprintM2!,
    totalBuiltAreaM2: input.totalBuiltAreaM2!,
    levels: input.levels!,
    parkingSpaces: input.parkingSpaces!,
    frontSetbackM: input.frontSetbackM
  });
  const requirements = evaluatePachucaSingleFamilyNewBuildRequirements(input);
  const reviewFlags: string[] = [];
  const sourceVersionIds = new Set<string>([CLASSIFICATION_SOURCE_VERSION_ID]);

  for (const candidate of classification.candidates) {
    for (const id of candidate.sourceVersionIds) sourceVersionIds.add(id);
  }
  for (const requirement of requirements) {
    for (const id of requirement.sourceVersionIds) sourceVersionIds.add(id);
  }

  if (classification.compatibleClassifications.length === 0) {
    reviewFlags.push("NO_VERIFIED_COMPATIBLE_CLASSIFICATION");
  }
  if (classification.indeterminateClassifications.length > 0) {
    reviewFlags.push("CLASSIFICATION_HAS_INDETERMINATE_CANDIDATES");
  }
  if (requirements.some((item) => item.status === "NEEDS_CHECK")) {
    reviewFlags.push("CONDITIONAL_REQUIREMENTS_NEED_CHECK");
  }

  for (const id of sourceVersionIds) {
    const resolved = resolvePachucaSourceVersion(id);
    if (!resolved) reviewFlags.push(`UNRESOLVED_SOURCE_VERSION:${id}`);
    else if (resolved.version.status === "PENDING_SCOPE_REVIEW") reviewFlags.push(`PENDING_SOURCE_SCOPE:${id}`);
  }

  return {
    jurisdiction: "mx-hgo-pachuca",
    projectType: "single-family-new-build",
    classification,
    requirements,
    missingInputs: [],
    reviewFlags: [...new Set(reviewFlags)],
    sourceVersionIds: [...sourceVersionIds]
  };
}

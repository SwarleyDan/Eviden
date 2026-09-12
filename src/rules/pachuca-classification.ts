import type { PachucaClassification } from "../calculator/pachuca";
import { estimatePachucaClassificationCompatibility, type PachucaCompatibilityInput, type PachucaCompatibilityEstimate } from "./pachuca-compatibility";

export type ClassificationCandidateStatus = "COMPATIBLE" | "INCOMPATIBLE" | "INDETERMINATE";

export type PachucaClassificationCandidate = {
  classification: PachucaClassification;
  status: ClassificationCandidateStatus;
  compatibility: PachucaCompatibilityEstimate;
  failedRules: string[];
  unknownRules: string[];
};

export type PachucaClassificationAnalysis = {
  status: "INFERRED";
  candidates: PachucaClassificationCandidate[];
  compatibleClassifications: PachucaClassification[];
  incompatibleClassifications: PachucaClassification[];
  indeterminateClassifications: PachucaClassification[];
};

const CLASSIFICATIONS: PachucaClassification[] = [
  "progressive",
  "economic",
  "popular",
  "social-interest",
  "medium-interest",
  "residential-medium",
  "residential-high",
  "campestre"
];

export function analyzePachucaClassificationCandidates(
  input: Omit<PachucaCompatibilityInput, "classification">
): PachucaClassificationAnalysis {
  const candidates = CLASSIFICATIONS.map((classification) => {
    const compatibility = estimatePachucaClassificationCompatibility({
      ...input,
      classification
    });
    const failedRules = compatibility.checks
      .filter((check) => check.status === "FAIL")
      .map((check) => check.rule);
    const unknownRules = compatibility.checks
      .filter((check) => check.status === "UNKNOWN")
      .map((check) => check.rule);

    const status: ClassificationCandidateStatus =
      failedRules.length > 0
        ? "INCOMPATIBLE"
        : unknownRules.length > 0
          ? "INDETERMINATE"
          : "COMPATIBLE";

    return { classification, status, compatibility, failedRules, unknownRules };
  });

  return {
    status: "INFERRED",
    candidates,
    compatibleClassifications: candidates.filter((item) => item.status === "COMPATIBLE").map((item) => item.classification),
    incompatibleClassifications: candidates.filter((item) => item.status === "INCOMPATIBLE").map((item) => item.classification),
    indeterminateClassifications: candidates.filter((item) => item.status === "INDETERMINATE").map((item) => item.classification)
  };
}

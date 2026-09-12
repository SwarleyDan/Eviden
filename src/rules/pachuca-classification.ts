import type { PachucaClassification } from "../calculator/pachuca";
import {
  estimatePachucaClassificationCompatibility,
  type PachucaCompatibilityInput,
  type PachucaCompatibilityEstimate
} from "./pachuca-compatibility";

export type ClassificationCandidateStatus = "COMPATIBLE" | "INCOMPATIBLE" | "INDETERMINATE";

export type PachucaClassificationCandidate = {
  classification: PachucaClassification;
  status: ClassificationCandidateStatus;
  compatibility: PachucaCompatibilityEstimate;
  failedRules: string[];
  unknownRules: string[];
  missingInputs: string[];
  unverifiedRules: string[];
  sourceVersionIds: string[];
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

const COMPATIBILITY_SOURCE_VERSION_ID = "source-version-human-settlements-regulation-2015-05-18";

function classifyCandidate(
  checks: PachucaCompatibilityEstimate["checks"]
): ClassificationCandidateStatus {
  if (checks.some((check) => check.status === "FAIL")) return "INCOMPATIBLE";

  // Missing project inputs keep a candidate indeterminate even when other
  // verified rules pass. A rule that is simply not encoded is tracked
  // separately and does not by itself make a candidate indeterminate.
  const hasMissingInputs = checks.some(
    (check) => check.status === "UNKNOWN" && check.unknownReason === "MISSING_INPUT"
  );
  if (hasMissingInputs) return "INDETERMINATE";

  const hasVerifiedRule = checks.some((check) => check.status === "PASS");
  return hasVerifiedRule ? "COMPATIBLE" : "INDETERMINATE";
}

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
    const missingInputs = compatibility.checks
      .filter((check) => check.status === "UNKNOWN" && check.unknownReason === "MISSING_INPUT")
      .map((check) => check.rule);
    const unverifiedRules = compatibility.checks
      .filter((check) => check.status === "UNKNOWN" && check.unknownReason === "UNVERIFIED_RULE")
      .map((check) => check.rule);

    return {
      classification,
      status: classifyCandidate(compatibility.checks),
      compatibility,
      failedRules,
      unknownRules,
      missingInputs,
      unverifiedRules,
      sourceVersionIds: [COMPATIBILITY_SOURCE_VERSION_ID]
    };
  });

  return {
    status: "INFERRED",
    candidates,
    compatibleClassifications: candidates.filter((item) => item.status === "COMPATIBLE").map((item) => item.classification),
    incompatibleClassifications: candidates.filter((item) => item.status === "INCOMPATIBLE").map((item) => item.classification),
    indeterminateClassifications: candidates.filter((item) => item.status === "INDETERMINATE").map((item) => item.classification)
  };
}

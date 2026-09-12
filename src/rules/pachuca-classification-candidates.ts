import type { PachucaClassification } from "../calculator/pachuca";
import {
  estimatePachucaClassificationCompatibility,
  type PachucaCompatibilityCheck,
  type PachucaCompatibilityInput
} from "./pachuca-compatibility";

export type PachucaCandidateStatus = "COMPATIBLE" | "INCOMPATIBLE" | "INDETERMINATE";

export type PachucaClassificationCandidate = {
  classification: PachucaClassification;
  status: PachucaCandidateStatus;
  compatibility: ReturnType<typeof estimatePachucaClassificationCompatibility>;
  blockingFailures: PachucaCompatibilityCheck[];
  unknownChecks: PachucaCompatibilityCheck[];
  sourceVersionIds: string[];
};

export type PachucaClassificationCandidates = {
  status: "INFERRED";
  candidates: PachucaClassificationCandidate[];
};

const CLASSIFICATIONS: readonly PachucaClassification[] = [
  "progressive",
  "economic",
  "popular",
  "social-interest",
  "medium-interest",
  "residential-medium",
  "residential-high",
  "campestre"
];

// The encoded general parameters currently derive from this state regulation.
const COMPATIBILITY_SOURCE_VERSION_ID = "source-version-human-settlements-regulation-2015-05-18";

function classify(checks: PachucaCompatibilityCheck[]): PachucaCandidateStatus {
  if (checks.some((check) => check.status === "FAIL")) return "INCOMPATIBLE";
  if (checks.some((check) => check.status === "UNKNOWN")) return "INDETERMINATE";
  return "COMPATIBLE";
}

export function analyzePachucaClassificationCandidates(
  input: Omit<PachucaCompatibilityInput, "classification">
): PachucaClassificationCandidates {
  const candidates = CLASSIFICATIONS.map((classification) => {
    const compatibility = estimatePachucaClassificationCompatibility({
      ...input,
      classification
    });
    const blockingFailures = compatibility.checks.filter((check) => check.status === "FAIL");
    const unknownChecks = compatibility.checks.filter((check) => check.status === "UNKNOWN");

    return {
      classification,
      status: classify(compatibility.checks),
      compatibility,
      blockingFailures,
      unknownChecks,
      sourceVersionIds: [COMPATIBILITY_SOURCE_VERSION_ID]
    };
  });

  const priority: Record<PachucaCandidateStatus, number> = {
    COMPATIBLE: 0,
    INDETERMINATE: 1,
    INCOMPATIBLE: 2
  };

  candidates.sort((a, b) => {
    const statusOrder = priority[a.status] - priority[b.status];
    if (statusOrder !== 0) return statusOrder;
    return a.classification.localeCompare(b.classification);
  });

  return { status: "INFERRED", candidates };
}

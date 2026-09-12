import evidenceData from "../../data/pachuca/evidence.json";
import { getPachucaSourceVersion } from "./pachuca-sources";

export type PachucaEvidenceStatus = "VERIFIED" | "UNVERIFIED" | "CONFLICT";

export type PachucaEvidence = {
  id: string;
  sourceVersionId: string;
  provision: string;
  description: string;
  verificationStatus: PachucaEvidenceStatus;
  page?: number;
};

type EvidenceData = {
  jurisdiction: string;
  evidence: PachucaEvidence[];
};

const data = evidenceData as EvidenceData;

export function getPachucaEvidence(id: string): PachucaEvidence | undefined {
  return data.evidence.find((evidence) => evidence.id === id);
}

export function isPachucaEvidenceUsable(id: string): boolean {
  const evidence = getPachucaEvidence(id);
  return (
    evidence !== undefined &&
    evidence.verificationStatus === "VERIFIED" &&
    getPachucaSourceVersion(evidence.sourceVersionId) !== undefined
  );
}

export function listPachucaEvidence(): readonly PachucaEvidence[] {
  return data.evidence;
}

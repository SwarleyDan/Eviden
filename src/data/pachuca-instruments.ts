import instrumentsData from "../../data/pachuca/instruments.json";

export type PachucaInstrumentStatus =
  | "ACTIVE_REFERENCE"
  | "HISTORICAL_OR_STATUS_REVIEW"
  | "PENDING_SCOPE_REVIEW";

export type PachucaInstrument = {
  id: string;
  name: string;
  type: string;
  status: PachucaInstrumentStatus;
  sourceVersionId?: string;
  scope?: string[];
  publishedAt?: string;
  notes?: string;
};

const instruments = instrumentsData.instruments as PachucaInstrument[];

export function getPachucaInstrument(id: string): PachucaInstrument | undefined {
  return instruments.find((instrument) => instrument.id === id);
}

export function listPachucaInstruments(): readonly PachucaInstrument[] {
  return instruments;
}

export function listPachucaReviewPendingInstruments(): readonly PachucaInstrument[] {
  return instruments.filter(
    (instrument) =>
      instrument.status === "PENDING_SCOPE_REVIEW" ||
      instrument.status === "HISTORICAL_OR_STATUS_REVIEW"
  );
}

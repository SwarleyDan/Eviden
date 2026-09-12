import { describe, expect, it } from "vitest";
import {
  getPachucaEvidence,
  isPachucaEvidenceUsable,
  listPachucaEvidence
} from "../../src/data/pachuca-evidence";

describe("Pachuca evidence registry", () => {
  it("resolves verified evidence to a source version", () => {
    const evidence = getPachucaEvidence("income-law-2026-art26-construction");

    expect(evidence?.sourceVersionId).toBe("source-version-income-law-2026-12-31");
    expect(evidence?.provision).toBe("Art. 26");
    expect(isPachucaEvidenceUsable("income-law-2026-art26-construction")).toBe(true);
  });

  it("does not treat missing evidence as usable", () => {
    expect(isPachucaEvidenceUsable("missing-evidence")).toBe(false);
  });

  it("keeps the registry finite and populated", () => {
    expect(listPachucaEvidence().length).toBeGreaterThan(0);
  });
});

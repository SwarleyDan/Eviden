import { describe, expect, it } from "vitest";
import { analyzePachucaClassificationCandidates } from "../../src/rules/pachuca-classification-candidates";

describe("Pachuca classification candidate analyzer", () => {
  const baseInput = {
    lotAreaM2: 300,
    frontageM: 10,
    footprintM2: 180,
    totalBuiltAreaM2: 360,
    levels: 2,
    parkingSpaces: 2,
    frontSetbackM: 5
  };

  it("returns compatible candidates before indeterminate and incompatible ones", () => {
    const result = analyzePachucaClassificationCandidates(baseInput);

    expect(result.status).toBe("INFERRED");
    expect(result.candidates).toHaveLength(8);
    expect(result.candidates.slice(0, 3).every((candidate) => candidate.status === "COMPATIBLE")).toBe(true);
    expect(result.candidates.some((candidate) => candidate.status === "INDETERMINATE")).toBe(true);
    expect(result.candidates.some((candidate) => candidate.status === "INCOMPATIBLE")).toBe(true);
  });

  it("marks a fully verified residential-medium case as compatible", () => {
    const result = analyzePachucaClassificationCandidates({
      lotAreaM2: 300,
      frontageM: 10,
      footprintM2: 180,
      totalBuiltAreaM2: 360,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    const candidate = result.candidates.find((item) => item.classification === "residential-medium");
    expect(candidate?.status).toBe("COMPATIBLE");
    expect(candidate?.blockingFailures).toEqual([]);
    expect(candidate?.unknownChecks).toHaveLength(1);
  });

  it("never upgrades a classification with no encoded rules to compatible", () => {
    const result = analyzePachucaClassificationCandidates(baseInput);
    const economic = result.candidates.find((item) => item.classification === "economic");

    expect(economic?.status).toBe("INDETERMINATE");
    expect(economic?.blockingFailures).toEqual([]);
    expect(economic?.unknownChecks.length).toBeGreaterThan(0);
  });

  it("exposes the rule provenance on every candidate", () => {
    const result = analyzePachucaClassificationCandidates(baseInput);

    for (const candidate of result.candidates) {
      expect(candidate.sourceVersionIds).toContain("source-version-human-settlements-regulation-2015-05-18");
    }
  });

  it("rejects invalid geometry consistently with the underlying compatibility engine", () => {
    expect(() =>
      analyzePachucaClassificationCandidates({
        ...baseInput,
        lotAreaM2: 0
      })
    ).toThrow();
  });
});

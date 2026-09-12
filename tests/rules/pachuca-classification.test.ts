import { describe, expect, it } from "vitest";
import { analyzePachucaClassificationCandidates } from "../../src/rules/pachuca-classification";

describe("Pachuca classification candidates", () => {
  it("identifies classifications that pass the encoded general rules", () => {
    const result = analyzePachucaClassificationCandidates({
      lotAreaM2: 220,
      frontageM: 10,
      footprintM2: 130,
      totalBuiltAreaM2: 260,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    expect(result.status).toBe("INFERRED");
    expect(result.compatibleClassifications).toContain("residential-medium");
    expect(result.incompatibleClassifications).toContain("residential-high");
    expect(result.indeterminateClassifications).toContain("economic");
  });

  it("never upgrades an unknown classification rule into compatibility", () => {
    const result = analyzePachucaClassificationCandidates({
      lotAreaM2: 200,
      frontageM: 8,
      footprintM2: 100,
      totalBuiltAreaM2: 100,
      levels: 1,
      parkingSpaces: 1
    });

    const economic = result.candidates.find((item) => item.classification === "economic");
    expect(economic?.status).toBe("INDETERMINATE");
    expect(economic?.unknownRules.length).toBeGreaterThan(0);
  });

  it("rejects candidates when a verified limit is exceeded", () => {
    const result = analyzePachucaClassificationCandidates({
      lotAreaM2: 90,
      frontageM: 6,
      footprintM2: 80,
      totalBuiltAreaM2: 160,
      levels: 3,
      parkingSpaces: 0
    });

    const social = result.candidates.find((item) => item.classification === "social-interest");
    expect(social?.status).toBe("INCOMPATIBLE");
    expect(social?.failedRules).toEqual(expect.arrayContaining(["maximumLevels", "minimumParkingSpaces"]));
  });
});

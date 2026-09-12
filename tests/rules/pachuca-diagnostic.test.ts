import { describe, expect, it } from "vitest";
import { diagnosePachucaSingleFamilyNewBuild } from "../../src/rules/pachuca-diagnostic";

describe("Pachuca unified diagnostic", () => {
  it("combines costs, requirements and compatibility", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      isNewBuild: true,
      isInRiskZone: false,
      isInHistoricCenter: false,
      modifiesSidewalk: false,
      hasNeighborhoodAssociation: false,
      areaM2: 180,
      classification: "residential-medium",
      lotAreaM2: 300,
      frontageM: 10,
      footprintM2: 180,
      totalBuiltAreaM2: 180,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    expect(result.jurisdiction).toBe("mx-hgo-pachuca");
    expect(result.costs.totalKnown.amount).toBe(10984.4);
    expect(result.requirements.some((item) => item.status === "REQUIRED")).toBe(true);
    expect(result.compatibility?.status).toBe("INFERRED");
    expect(result.compatibility?.checks.every((item) => item.status !== "FAIL")).toBe(true);
    expect(result.missingInputs).toEqual([]);
    expect(result.reviewFlags).not.toContain("COMPATIBILITY_NOT_EVALUATED");
  });

  it("does not pretend compatibility is known when geometry is incomplete", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      isNewBuild: true,
      areaM2: 100,
      classification: "popular"
    });

    expect(result.compatibility).toBeUndefined();
    expect(result.reviewFlags).toContain("COMPATIBILITY_NOT_EVALUATED");
    expect(result.missingInputs).toContain("lotAreaM2");
    expect(result.missingInputs).toContain("parkingSpaces");
  });

  it("surfaces unresolved provenance rather than hiding it", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      isNewBuild: true,
      isInRiskZone: undefined,
      isInHistoricCenter: undefined,
      modifiesSidewalk: undefined,
      hasNeighborhoodAssociation: undefined,
      areaM2: 100,
      classification: "popular"
    });

    expect(result.reviewFlags).toContain("CONDITIONAL_REQUIREMENTS_NEED_CHECK");
    expect(result.sourceVersionIds.length).toBeGreaterThan(0);
  });
});

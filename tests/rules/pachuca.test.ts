import { describe, expect, it } from "vitest";
import { evaluatePachucaSingleFamilyNewBuildRequirements } from "../../src/rules/pachuca";

describe("Pachuca 2026 requirement rules", () => {
  it("returns the base procedures and activates obra nueva congruence", () => {
    const result = evaluatePachucaSingleFamilyNewBuildRequirements({
      isNewBuild: true,
      isInRiskZone: false,
      isInHistoricCenter: false,
      modifiesSidewalk: false,
      hasNeighborhoodAssociation: false
    });

    expect(result.filter((item) => item.status === "REQUIRED").map((item) => item.requirementId)).toContain(
      "land-use-ecological-congruence-new-work"
    );
    expect(result.find((item) => item.requirementId === "land-use-inah-conditional")?.status).toBe("NOT_REQUIRED");
    expect(result.find((item) => item.requirementId === "land-use-protection-civil-conditional")?.status).toBe("NOT_REQUIRED");
  });

  it("does not invent a location-dependent requirement when the location is unknown", () => {
    const result = evaluatePachucaSingleFamilyNewBuildRequirements({
      isNewBuild: true
    });

    expect(result.find((item) => item.requirementId === "land-use-inah-conditional")?.status).toBe("NEEDS_CHECK");
    expect(result.find((item) => item.requirementId === "construction-protection-civil-conditional")?.status).toBe("NEEDS_CHECK");
    expect(result.find((item) => item.requirementId === "land-use-mobility-conditional")?.status).toBe("NEEDS_CHECK");
    expect(result.find((item) => item.requirementId === "land-use-colonos-conditional")?.status).toBe("NEEDS_CHECK");
  });

  it("requires the conditional documents when their conditions are true", () => {
    const result = evaluatePachucaSingleFamilyNewBuildRequirements({
      isNewBuild: true,
      isInRiskZone: true,
      isInHistoricCenter: true,
      modifiesSidewalk: true,
      hasNeighborhoodAssociation: true
    });

    expect(result.filter((item) => item.status === "REQUIRED").map((item) => item.requirementId)).toEqual(
      expect.arrayContaining([
        "land-use-protection-civil-conditional",
        "construction-protection-civil-conditional",
        "land-use-inah-conditional",
        "construction-inah-conditional",
        "land-use-mobility-conditional",
        "land-use-colonos-conditional"
      ])
    );
  });

  it("rejects unsupported non-new-build scenarios in the MVP", () => {
    expect(() =>
      evaluatePachucaSingleFamilyNewBuildRequirements({ isNewBuild: false })
    ).toThrow();
  });
});

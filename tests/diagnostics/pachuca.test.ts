import { describe, expect, it } from "vitest";
import { diagnosePachucaSingleFamilyNewBuild } from "../../src/diagnostics/pachuca";

describe("Pachuca unified diagnostic", () => {
  it("combines verified fees, conditional requirements and inferred compatibility", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      areaM2: 180,
      classification: "residential-medium",
      isNewBuild: true,
      lotAreaM2: 300,
      frontageM: 10,
      footprintM2: 180,
      totalBuiltAreaM2: 360,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5,
      isInRiskZone: false,
      isInHistoricCenter: false,
      modifiesSidewalk: false,
      hasNeighborhoodAssociation: false
    });

    expect(result.project).toEqual({
      type: "single-family-new-build",
      areaM2: 180,
      classification: "residential-medium"
    });
    expect(result.estimate.totalKnown.amount).toBeCloseTo(10984.4, 10);
    expect(result.estimate.unknownFees).toEqual([]);
    expect(result.requirements.some((item) => item.status === "NEEDS_CHECK")).toBe(false);
    expect(result.compatibility?.status).toBe("INFERRED");
    expect(result.compatibility?.checks.map((item) => item.status)).toEqual([
      "PASS",
      "UNKNOWN",
      "PASS",
      "PASS",
      "PASS",
      "PASS"
    ]);
    expect(result.reviewFlags).toEqual([
      "INFERRED_COMPATIBILITY",
      "COMPATIBILITY_NEEDS_CHECK"
    ]);
  });

  it("does not convert missing conditional facts into false", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      areaM2: 100,
      classification: "progressive",
      isNewBuild: true
    });

    expect(result.requirements.some((item) => item.status === "NEEDS_CHECK")).toBe(true);
    expect(result.reviewFlags).toContain("REQUIREMENTS_NEED_CHECK");
    expect(result.compatibility).toBeUndefined();
  });

  it("keeps compatibility absent until all geometric inputs required by the estimator exist", () => {
    const result = diagnosePachucaSingleFamilyNewBuild({
      areaM2: 120,
      classification: "popular",
      isNewBuild: true,
      lotAreaM2: 180,
      frontageM: 8,
      footprintM2: 100,
      totalBuiltAreaM2: 120,
      levels: 2
    });

    expect(result.compatibility).toBeUndefined();
  });

  it("rejects unsupported project modality", () => {
    expect(() =>
      diagnosePachucaSingleFamilyNewBuild({
        areaM2: 100,
        classification: "popular",
        isNewBuild: false
      })
    ).toThrow("obra nueva");
  });
});

import { describe, expect, it } from "vitest";
import { diagnosePachucaSingleFamilyNewBuildWithoutClassification } from "../../src/rules/pachuca-diagnostic-unknown-classification";

describe("Pachuca diagnostic without known classification", () => {
  it("infers compatible and incompatible classification candidates from geometry", () => {
    const result = diagnosePachucaSingleFamilyNewBuildWithoutClassification({
      isNewBuild: true,
      isInRiskZone: false,
      isInHistoricCenter: false,
      modifiesSidewalk: false,
      hasNeighborhoodAssociation: false,
      lotAreaM2: 220,
      frontageM: 10,
      footprintM2: 130,
      totalBuiltAreaM2: 260,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    expect(result.missingInputs).toEqual([]);
    expect(result.classification.status).toBe("INFERRED");
    expect(result.classification.compatibleClassifications).toContain("residential-medium");
    expect(result.classification.incompatibleClassifications).toContain("residential-high");
    expect(result.classification.indeterminateClassifications).toContain("economic");
    expect(result.reviewFlags).not.toContain("NO_VERIFIED_COMPATIBLE_CLASSIFICATION");
  });

  it("does not infer classification when required geometry is incomplete", () => {
    const result = diagnosePachucaSingleFamilyNewBuildWithoutClassification({
      isNewBuild: true,
      lotAreaM2: 220,
      frontageM: 10,
      footprintM2: 130,
      totalBuiltAreaM2: 260,
      levels: 2
    });

    expect(result.classification.candidates).toHaveLength(0);
    expect(result.missingInputs).toEqual(["parkingSpaces"]);
    expect(result.reviewFlags).toContain("CLASSIFICATION_NOT_EVALUATED");
    expect(result.reviewFlags).toContain("CLASSIFICATION_GEOMETRY_INCOMPLETE");
  });

  it("preserves unknown conditional requirements instead of treating them as false", () => {
    const result = diagnosePachucaSingleFamilyNewBuildWithoutClassification({
      isNewBuild: true,
      lotAreaM2: 300,
      frontageM: 10,
      footprintM2: 180,
      totalBuiltAreaM2: 180,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    expect(result.requirements.some((item) => item.status === "NEEDS_CHECK")).toBe(true);
    expect(result.reviewFlags).toContain("CONDITIONAL_REQUIREMENTS_NEED_CHECK");
  });

  it("never calculates classification-dependent fees without a classification", () => {
    const result = diagnosePachucaSingleFamilyNewBuildWithoutClassification({
      isNewBuild: true,
      lotAreaM2: 300,
      frontageM: 10,
      footprintM2: 180,
      totalBuiltAreaM2: 180,
      levels: 2,
      parkingSpaces: 2
    });

    expect(result).not.toHaveProperty("costs");
    expect(result).not.toHaveProperty("totalKnown");
  });
});

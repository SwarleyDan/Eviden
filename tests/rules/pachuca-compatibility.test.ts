import { describe, expect, it } from "vitest";
import { estimatePachucaClassificationCompatibility } from "../../src/rules/pachuca-compatibility";

describe("Pachuca orientative classification compatibility", () => {
  it("passes verified residential-medium parameters while marking unverified frontage as unknown", () => {
    const result = estimatePachucaClassificationCompatibility({
      classification: "residential-medium",
      lotAreaM2: 200,
      frontageM: 10,
      footprintM2: 120,
      totalBuiltAreaM2: 240,
      levels: 2,
      parkingSpaces: 2,
      frontSetbackM: 5
    });

    expect(result.status).toBe("INFERRED");
    expect(result.cos).toBe(0.6);
    expect(result.cus).toBe(1.2);
    expect(result.checks.map((check) => check.status)).toEqual(["PASS", "UNKNOWN", "PASS", "PASS", "PASS", "PASS"]);
  });

  it("flags residential-medium when verified limits are exceeded", () => {
    const result = estimatePachucaClassificationCompatibility({
      classification: "residential-medium",
      lotAreaM2: 180,
      frontageM: 8,
      footprintM2: 130,
      totalBuiltAreaM2: 300,
      levels: 4,
      parkingSpaces: 1,
      frontSetbackM: 3
    });

    expect(result.checks.map((check) => check.status)).toEqual(["FAIL", "UNKNOWN", "FAIL", "FAIL", "FAIL", "FAIL"]);
  });

  it("does not invent rules for a classification with no encoded general parameters", () => {
    const result = estimatePachucaClassificationCompatibility({
      classification: "economic",
      lotAreaM2: 90,
      frontageM: 6,
      footprintM2: 60,
      totalBuiltAreaM2: 90,
      levels: 2,
      parkingSpaces: 1
    });

    expect(result.status).toBe("INFERRED");
    expect(result.checks.every((check) => check.status === "UNKNOWN")).toBe(true);
  });

  it("requires positive geometric inputs", () => {
    expect(() =>
      estimatePachucaClassificationCompatibility({
        classification: "popular",
        lotAreaM2: 0,
        frontageM: 6,
        footprintM2: 50,
        totalBuiltAreaM2: 80,
        levels: 2,
        parkingSpaces: 1
      })
    ).toThrow();
  });
});

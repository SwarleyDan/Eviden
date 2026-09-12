import { describe, expect, it } from "vitest";
import { estimatePachucaSingleFamilyNewBuild } from "../../src/calculator/pachuca";

describe("Pachuca 2026 single-family new-build estimate", () => {
  it("calculates the known fees for 180 m² residential-medium", () => {
    const result = estimatePachucaSingleFamilyNewBuild(180, "residential-medium");

    expect(result.lines).toHaveLength(4);
    expect(result.unknownFees).toEqual([]);
    expect(result.lines.map((line) => line.amount)).toEqual([158, 939, 9406.8, 480.6]);
    expect(result.totalKnown.amount).toBe(10984.4);
    expect(result.totalKnown.currency).toBe("MXN");
  });

  it("uses the primary 2026 construction tariff for economic housing", () => {
    const result = estimatePachucaSingleFamilyNewBuild(180, "economic");

    expect(result.unknownFees).toEqual([]);
    expect(result.lines.map((line) => line.amount)).toEqual([158, 313, 3708, 480.6]);
    expect(result.totalKnown.amount).toBe(4659.6);
  });

  it("uses the primary 2026 tariff for progressive housing", () => {
    const result = estimatePachucaSingleFamilyNewBuild(100, "progressive");

    expect(result.unknownFees).toEqual([]);
    expect(result.lines.map((line) => line.amount)).toEqual([158, 522, 2060, 267]);
    expect(result.totalKnown.amount).toBe(3007);
  });

  it("supports the verified construction tariff across every classification", () => {
    const expectedRates = {
      progressive: 20.6,
      economic: 20.6,
      popular: 20.6,
      "social-interest": 35.02,
      "medium-interest": 41.2,
      "residential-medium": 52.26,
      "residential-high": 55.62,
      campestre: 35.02
    } as const;

    for (const [classification, rate] of Object.entries(expectedRates)) {
      const result = estimatePachucaSingleFamilyNewBuild(100, classification as keyof typeof expectedRates);
      expect(result.unknownFees).toEqual([]);
      expect(result.lines.find((line) => line.feeId === `construction-${classification}`)?.amount).toBeCloseTo(rate * 100, 10);
    }
  });

  it("exposes provenance for every verified fee line", () => {
    const result = estimatePachucaSingleFamilyNewBuild(180, "residential-medium");

    for (const line of result.lines) {
      expect(line.sourceVersionIds.length).toBeGreaterThan(0);
      expect(line.evidenceRefs.length).toBeGreaterThan(0);
    }

    expect(result.lines.find((line) => line.feeId === "construction-residential-medium")?.evidenceRefs)
      .toContain("income-law-2026-art26-construction");
  });

  it("rejects zero or negative area", () => {
    expect(() => estimatePachucaSingleFamilyNewBuild(0, "residential-medium")).toThrow();
    expect(() => estimatePachucaSingleFamilyNewBuild(-10, "residential-medium")).toThrow();
  });
});

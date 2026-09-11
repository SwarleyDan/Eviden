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

  it("rejects zero or negative area", () => {
    expect(() => estimatePachucaSingleFamilyNewBuild(0, "residential-medium")).toThrow();
    expect(() => estimatePachucaSingleFamilyNewBuild(-10, "residential-medium")).toThrow();
  });
});

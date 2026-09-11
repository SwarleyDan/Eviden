import { describe, expect, it } from "vitest";
import { calculatePerSquareMeter } from "../../src/calculator";

describe("calculatePerSquareMeter", () => {
  it("calculates a derived MXN amount", () => {
    expect(calculatePerSquareMeter(180, 52.26)).toEqual({
      amount: 9406.8,
      currency: "MXN",
      status: "DERIVED"
    });
  });

  it("rejects invalid area", () => {
    expect(() => calculatePerSquareMeter(-1, 52.26)).toThrow();
  });
});

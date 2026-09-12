import { describe, expect, it } from "vitest";
import {
  getPachucaSource,
  getPachucaSourceActivationStatus,
  getPachucaSourceVersion,
  isPachucaSourceVersionUsable,
  resolvePachucaSourceVersion
} from "../../src/data/pachuca-sources";

describe("Pachuca source provenance", () => {
  it("resolves a source version to its official source", () => {
    const resolved = resolvePachucaSourceVersion(
      "source-version-income-law-2026-12-31"
    );

    expect(resolved?.source.id).toBe("pachuca-income-law-2026-original");
    expect(resolved?.source.authorityLevel).toBe("PRIMARY_OFFICIAL");
    expect(resolved?.source.url).toContain("Ley_Ingresos_Pachuca_2026.pdf");
    expect(resolved?.version.effectiveFrom).toBe("2026-01-01");
    expect(getPachucaSourceActivationStatus("source-version-income-law-2026-12-31")).toBe("USABLE");
    expect(isPachucaSourceVersionUsable("source-version-income-law-2026-12-31")).toBe(true);
  });

  it("keeps unresolved source-version IDs explicit", () => {
    expect(getPachucaSourceVersion("missing-version")).toBeUndefined();
    expect(resolvePachucaSourceVersion("missing-version")).toBeUndefined();
    expect(getPachucaSourceActivationStatus("missing-version")).toBe("MISSING");
    expect(isPachucaSourceVersionUsable("missing-version")).toBe(false);
  });

  it("does not treat the PPDU as an active rule before scope review", () => {
    const source = getPachucaSource("pachuca-ppdu-pachuca-mineral-2026");
    const version = getPachucaSourceVersion(
      "source-version-pachuca-ppdu-2026-08-25"
    );

    expect(source?.authorityLevel).toBe("PRIMARY_OFFICIAL");
    expect(version?.status).toBe("PENDING_SCOPE_REVIEW");
    expect(getPachucaSourceActivationStatus("source-version-pachuca-2026-08-25")).toBe("MISSING");
    expect(getPachucaSourceActivationStatus("source-version-pachuca-ppdu-2026-08-25")).toBe("PENDING_SCOPE_REVIEW");
    expect(isPachucaSourceVersionUsable("source-version-pachuca-ppdu-2026-08-25")).toBe(false);
  });
});

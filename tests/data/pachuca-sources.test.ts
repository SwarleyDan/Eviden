import { describe, expect, it } from "vitest";
import {
  getPachucaSource,
  getPachucaSourceVersion,
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
  });

  it("keeps unresolved source-version IDs explicit", () => {
    expect(getPachucaSourceVersion("missing-version")).toBeUndefined();
    expect(resolvePachucaSourceVersion("missing-version")).toBeUndefined();
  });

  it("exposes the official PPDU as a pending source version", () => {
    const source = getPachucaSource("pachuca-ppdu-pachuca-mineral-2026");
    const version = getPachucaSourceVersion(
      "source-version-pachuca-ppdu-2026-08-25"
    );

    expect(source?.authorityLevel).toBe("PRIMARY_OFFICIAL");
    expect(version?.status).toBe("PENDING_SCOPE_REVIEW");
  });
});

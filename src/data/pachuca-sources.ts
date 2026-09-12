import sourcesData from "../../data/pachuca/sources.json";

export type PachucaSource = {
  id: string;
  institution: string;
  title: string;
  url: string;
  type: string;
  authorityLevel: "PRIMARY_OFFICIAL" | "OFFICIAL_OPERATIONAL" | string;
  publicationDate?: string;
  retrievedAt: string;
  notes?: string;
};

export type PachucaSourceVersion = {
  id: string;
  sourceId: string;
  versionLabel: string;
  publishedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  retrievedAt: string;
  status?: string;
};

type PachucaSourcesData = {
  sources: PachucaSource[];
  versions: PachucaSourceVersion[];
};

const data = sourcesData as PachucaSourcesData;

export function getPachucaSource(id: string): PachucaSource | undefined {
  return data.sources.find((source) => source.id === id);
}

export function getPachucaSourceVersion(id: string): PachucaSourceVersion | undefined {
  return data.versions.find((version) => version.id === id);
}

export function resolvePachucaSourceVersion(id: string):
  | { source: PachucaSource; version: PachucaSourceVersion }
  | undefined {
  const version = getPachucaSourceVersion(id);
  if (!version) return undefined;

  const source = getPachucaSource(version.sourceId);
  if (!source) return undefined;

  return { source, version };
}

export function listPachucaSources(): readonly PachucaSource[] {
  return data.sources;
}

export function listPachucaSourceVersions(): readonly PachucaSourceVersion[] {
  return data.versions;
}

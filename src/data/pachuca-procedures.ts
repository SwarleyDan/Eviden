import proceduresData from "../../data/pachuca/procedures.json";

export type PachucaRequirement = {
  id: string;
  procedureId: string;
  name: string;
  description?: string;
  required: boolean;
  conditional?: boolean;
  condition?: string;
  sourceVersionIds: string[];
};

export type PachucaProcedure = {
  id: string;
  name: string;
  slug: string;
  authority: string;
  homoclave: string;
  description: string;
  responseTime: string;
  validity?: string;
  status: string;
  sourceVersionIds: string[];
  requirementIds: string[];
};

type ProceduresData = {
  procedures: PachucaProcedure[];
  requirements: PachucaRequirement[];
};

const data = proceduresData as ProceduresData;

export function getPachucaProcedure(id: string): PachucaProcedure | undefined {
  return data.procedures.find((procedure) => procedure.id === id);
}

export function listPachucaRequirements(procedureId: string): PachucaRequirement[] {
  return data.requirements.filter((requirement) => requirement.procedureId === procedureId);
}

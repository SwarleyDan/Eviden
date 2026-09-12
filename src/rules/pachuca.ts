import {
  getPachucaProcedure,
  listPachucaRequirements,
  type PachucaRequirement
} from "../data/pachuca-procedures";

export type PachucaRuleInput = {
  isNewBuild: boolean;
  isInRiskZone?: boolean;
  isInHistoricCenter?: boolean;
  modifiesSidewalk?: boolean;
  hasNeighborhoodAssociation?: boolean;
};

export type RequirementDecision = {
  requirementId: string;
  procedureId: string;
  name: string;
  status: "REQUIRED" | "CONDITIONAL" | "NOT_REQUIRED" | "NEEDS_CHECK";
  reason?: string;
  sourceVersionIds: string[];
};

function evaluateConditionalRequirement(
  requirement: PachucaRequirement,
  input: PachucaRuleInput
): RequirementDecision["status"] {
  switch (requirement.id) {
    case "land-use-ecological-congruence-new-work":
      return input.isNewBuild ? "REQUIRED" : "NOT_REQUIRED";
    case "land-use-protection-civil-conditional":
    case "construction-protection-civil-conditional":
      return input.isInRiskZone === undefined
        ? "NEEDS_CHECK"
        : input.isInRiskZone
          ? "REQUIRED"
          : "NOT_REQUIRED";
    case "land-use-mobility-conditional":
      return input.modifiesSidewalk === undefined
        ? "NEEDS_CHECK"
        : input.modifiesSidewalk
          ? "REQUIRED"
          : "NOT_REQUIRED";
    case "land-use-inah-conditional":
    case "construction-inah-conditional":
      return input.isInHistoricCenter === undefined
        ? "NEEDS_CHECK"
        : input.isInHistoricCenter
          ? "REQUIRED"
          : "NOT_REQUIRED";
    case "land-use-colonos-conditional":
      return input.hasNeighborhoodAssociation === undefined
        ? "NEEDS_CHECK"
        : input.hasNeighborhoodAssociation
          ? "REQUIRED"
          : "NOT_REQUIRED";
    default:
      return "CONDITIONAL";
  }
}

function decideRequirement(
  requirement: PachucaRequirement,
  input: PachucaRuleInput
): RequirementDecision {
  if (!requirement.conditional) {
    return {
      requirementId: requirement.id,
      procedureId: requirement.procedureId,
      name: requirement.name,
      status: requirement.required ? "REQUIRED" : "NOT_REQUIRED",
      sourceVersionIds: requirement.sourceVersionIds
    };
  }

  const status = evaluateConditionalRequirement(requirement, input);

  return {
    requirementId: requirement.id,
    procedureId: requirement.procedureId,
    name: requirement.name,
    status,
    reason: requirement.condition,
    sourceVersionIds: requirement.sourceVersionIds
  };
}

export function evaluatePachucaSingleFamilyNewBuildRequirements(
  input: PachucaRuleInput
): RequirementDecision[] {
  const procedureIds = [
    "alignment-official-number",
    "land-use-license-residential-single-family",
    "construction-license"
  ];

  if (!input.isNewBuild) {
    throw new Error("The current MVP rule set only supports obra nueva");
  }

  const decisions: RequirementDecision[] = [];

  for (const procedureId of procedureIds) {
    const procedure = getPachucaProcedure(procedureId);
    if (!procedure) {
      throw new Error(`Unknown Pachuca procedure: ${procedureId}`);
    }

    for (const requirement of listPachucaRequirements(procedure.id)) {
      decisions.push(decideRequirement(requirement, input));
    }
  }

  return decisions;
}

export type VerificationStatus = "VERIFIED" | "DERIVED" | "INFERRED" | "UNKNOWN" | "CONFLICT";
export type FeeFormulaType = "FIXED" | "PER_UNIT" | "TIERED" | "CONDITIONAL" | "COMPOSITE";
export type AuthorityLevel = "PRIMARY_OFFICIAL" | "OFFICIAL_OPERATIONAL" | "SECONDARY";

export interface Source { id: string; institution: string; title: string; url: string; type: string; authorityLevel: AuthorityLevel; publicationDate?: string; retrievedAt: string; }
export interface SourceVersion { id: string; sourceId: string; versionLabel: string; publishedAt?: string; effectiveFrom?: string; effectiveUntil?: string; retrievedAt: string; }
export interface Evidence { id: string; sourceVersionId: string; entityType: string; entityId: string; reference: string; excerpt?: string; verificationStatus: VerificationStatus; verifiedAt: string; notes?: string; }
export interface ProcedureRequirement { id: string; procedureId: string; name: string; description?: string; required: boolean; conditional?: boolean; condition?: string; sourceVersionIds: string[]; }
export interface Procedure { id: string; jurisdictionId: string; name: string; slug: string; authority: string; homoclave?: string; description: string; responseTime?: string; validity?: string; status: VerificationStatus; sourceVersionIds: string[]; requirementIds: string[]; }
export interface Classification { id: string; name: string; slug: string; category: "RESIDENTIAL"; notes?: string; }
export interface ClassificationRule { id: string; classificationId: string; parameter: string; operator: "LTE" | "GTE" | "EQ" | "LT" | "GT"; value: number; unit: string; sourceVersionIds: string[]; status: VerificationStatus; }
export interface Fee { id: string; procedureId: string; classificationId?: string; fiscalYear: number; amount: number; currency: "MXN"; unit: string; formulaType: FeeFormulaType; status: VerificationStatus; sourceVersionIds: string[]; notes?: string; }
export interface Jurisdiction { id: string; state: string; municipality: string; country: string; slug: string; }

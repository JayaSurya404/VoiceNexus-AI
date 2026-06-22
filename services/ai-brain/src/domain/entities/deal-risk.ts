export type DealRiskType =
  | "STALLED_DEAL"
  | "LOW_ENGAGEMENT"
  | "MISSING_FOLLOW_UP"
  | "DECLINING_SENTIMENT"
  | "LONG_SALES_CYCLE";

export interface DealRisk {
  id: string;
  organizationId: string;
  opportunityId: string;
  riskType: DealRiskType;
  riskScore: number;
  reasons: string[];
  recommendedActions: string[];
  active: boolean;
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

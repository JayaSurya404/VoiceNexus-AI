export type BusinessInsightType = "GROWTH_OPPORTUNITY" | "PERFORMANCE_ANOMALY" | "RISK_INDICATOR" | "OPTIMIZATION_SUGGESTION";

export interface BusinessInsight {
  id: string;
  organizationId: string;
  type: BusinessInsightType;
  title: string;
  message: string;
  impactScore: number;
  recommendedActions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type OptimizationRecommendationType =
  | "QUEUE_BALANCING"
  | "AGENT_REALLOCATION"
  | "WORKFLOW_TUNING"
  | "KNOWLEDGE_IMPROVEMENT"
  | "REVENUE_RECOVERY"
  | "COACHING_INTERVENTION"
  | "SELF_HEALING";

export interface OptimizationRecommendation {
  id: string;
  organizationId: string;
  type: OptimizationRecommendationType;
  title: string;
  rationale: string;
  confidence: number;
  expectedImpact: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ACTIONED" | "DISMISSED";
  createdAt: Date;
  updatedAt: Date;
}

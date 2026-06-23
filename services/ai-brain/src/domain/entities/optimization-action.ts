export type OptimizationActionStatus = "PENDING" | "APPROVED" | "RUNNING" | "COMPLETED" | "FAILED" | "DISMISSED";

export interface OptimizationAction {
  id: string;
  organizationId: string;
  recommendationId: string | null;
  scope: "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";
  title: string;
  description: string;
  status: OptimizationActionStatus;
  impactScore: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

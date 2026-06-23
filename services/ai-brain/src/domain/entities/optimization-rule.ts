export type OptimizationRuleScope = "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";

export interface OptimizationRule {
  id: string;
  organizationId: string;
  name: string;
  scope: OptimizationRuleScope;
  condition: Record<string, unknown>;
  action: string;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptimizationMetric {
  id: string;
  organizationId: string;
  name: string;
  scope: "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";
  value: number;
  target: number;
  unit: string;
  status: "HEALTHY" | "WATCH" | "BREACHED";
  measuredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

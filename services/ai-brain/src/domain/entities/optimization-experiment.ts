export interface OptimizationExperiment {
  id: string;
  organizationId: string;
  name: string;
  hypothesis: string;
  scope: "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";
  status: "PLANNED" | "RUNNING" | "COMPLETED" | "FAILED";
  baselineMetric: number;
  targetMetric: number;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptimizationGoal {
  id: string;
  organizationId: string;
  name: string;
  scope: "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  dueAt: Date | null;
  status: "ACTIVE" | "ACHIEVED" | "MISSED" | "PAUSED";
  createdAt: Date;
  updatedAt: Date;
}

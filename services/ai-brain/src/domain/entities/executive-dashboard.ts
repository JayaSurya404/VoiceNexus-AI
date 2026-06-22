export interface ExecutiveDashboard {
  id: string;
  organizationId: string;
  revenueOverview: Record<string, unknown>;
  salesOverview: Record<string, unknown>;
  coachingOverview: Record<string, unknown>;
  knowledgeOverview: Record<string, unknown>;
  agentOverview: Record<string, unknown>;
  aiPerformanceOverview: Record<string, unknown>;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

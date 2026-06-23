export interface OptimizationResult {
  id: string;
  organizationId: string;
  actionId: string | null;
  experimentId: string | null;
  metric: string;
  beforeValue: number;
  afterValue: number;
  impactPercent: number;
  summary: string;
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

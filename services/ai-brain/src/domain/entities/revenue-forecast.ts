export type RevenueForecastPeriod = "MONTH" | "QUARTER" | "YEAR";

export interface RevenueForecast {
  id: string;
  organizationId: string;
  period: RevenueForecastPeriod;
  periodStart: Date;
  periodEnd: Date;
  pipelineValue: number;
  weightedRevenue: number;
  committedRevenue: number;
  projectedRevenue: number;
  opportunityCount: number;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

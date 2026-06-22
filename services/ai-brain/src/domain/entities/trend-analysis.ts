export interface TrendAnalysis {
  id: string;
  organizationId: string;
  metric: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  values: Array<{ label: string; value: number }>;
  changePercent: number;
  direction: "UP" | "DOWN" | "FLAT";
  insight: string;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type KpiCategory = "REVENUE" | "SALES" | "SUPPORT" | "AI" | "CONVERSION";

export interface KpiMetric {
  id: string;
  organizationId: string;
  category: KpiCategory;
  name: string;
  value: number;
  target: number | null;
  unit: string;
  trend: "UP" | "DOWN" | "FLAT";
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  measuredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SalesInsightType =
  | "PIPELINE_GROWTH"
  | "RISK_CONCENTRATION"
  | "TOP_AGENT"
  | "LEAD_SOURCE"
  | "UPSELL_TREND"
  | "REVENUE_DRIVER";

export interface SalesInsight {
  id: string;
  organizationId: string;
  type: SalesInsightType;
  title: string;
  message: string;
  value: number;
  trend: "UP" | "DOWN" | "FLAT";
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

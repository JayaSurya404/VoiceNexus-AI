export type ReportTemplateType = "EXECUTIVE" | "KPI" | "TREND" | "BENCHMARK" | "CUSTOM";

export interface ReportTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: ReportTemplateType;
  sections: string[];
  filters: Record<string, unknown>;
  active: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

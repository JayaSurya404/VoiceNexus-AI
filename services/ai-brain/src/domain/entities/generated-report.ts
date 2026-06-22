export interface GeneratedReport {
  id: string;
  organizationId: string;
  templateId: string | null;
  scheduledReportId: string | null;
  title: string;
  status: "GENERATED" | "FAILED";
  summary: string;
  data: Record<string, unknown>;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

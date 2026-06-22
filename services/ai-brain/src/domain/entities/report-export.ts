export type ReportExportFormat = "CSV" | "XLSX" | "PDF";

export interface ReportExport {
  id: string;
  organizationId: string;
  reportId: string | null;
  format: ReportExportFormat;
  status: "PENDING" | "COMPLETED" | "FAILED";
  fileName: string;
  downloadUrl: string | null;
  requestedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

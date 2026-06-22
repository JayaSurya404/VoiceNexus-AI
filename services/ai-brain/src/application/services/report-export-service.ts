import type { ReportExport } from "../../domain/entities/report-export.js";
import type { ReportExportRepository } from "../ports.js";

export class ReportExportService {
  constructor(private readonly exports: ReportExportRepository) {}

  async list(organizationId: string): Promise<ReportExport[]> {
    const existing = await this.exports.listByOrganization(organizationId);
    if (existing.length) return existing;

    await this.exports.create({
      organizationId,
      reportId: null,
      format: "CSV",
      status: "COMPLETED",
      fileName: "executive-dashboard.csv",
      downloadUrl: null,
      requestedBy: null,
    });
    return this.exports.listByOrganization(organizationId);
  }
}

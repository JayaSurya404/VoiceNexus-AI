import type { ScheduledReport } from "../../domain/entities/scheduled-report.js";
import type { ScheduledReportRepository } from "../ports.js";

export class ScheduledReportService {
  constructor(private readonly reports: ScheduledReportRepository) {}

  list(organizationId: string): Promise<ScheduledReport[]> {
    return this.reports.listByOrganization(organizationId);
  }
}

import type { GeneratedReport } from "../../domain/entities/generated-report.js";
import type { GeneratedReportRepository, ReportTemplateRepository } from "../ports.js";
import { ReportingAnalyticsService } from "./reporting-analytics-service.js";

export class ReportBuilderService {
  constructor(
    private readonly templates: ReportTemplateRepository,
    private readonly generated: GeneratedReportRepository,
    private readonly analytics: ReportingAnalyticsService,
  ) {}

  async templatesForOrganization(organizationId: string) {
    return this.templates.listByOrganization(organizationId);
  }

  async generatedReports(organizationId: string): Promise<GeneratedReport[]> {
    const existing = await this.generated.listByOrganization(organizationId);
    if (existing.length) return existing;

    const overview = await this.analytics.overview(organizationId);
    await this.generated.create({
      organizationId,
      templateId: null,
      scheduledReportId: null,
      title: "Executive BI Snapshot",
      status: "GENERATED",
      summary: "Automated executive reporting snapshot generated from current business intelligence metrics.",
      data: { ...overview },
      generatedAt: new Date(),
    });

    return this.generated.listByOrganization(organizationId);
  }
}

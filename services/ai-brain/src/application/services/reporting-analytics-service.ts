import type {
  BusinessInsightRepository,
  GeneratedReportRepository,
  KpiMetricRepository,
  ReportExportRepository,
  ReportTemplateRepository,
  ReportingAnalyticsOverview,
  ScheduledReportRepository,
} from "../ports.js";

export class ReportingAnalyticsService {
  constructor(
    private readonly templates: ReportTemplateRepository,
    private readonly scheduled: ScheduledReportRepository,
    private readonly generated: GeneratedReportRepository,
    private readonly kpis: KpiMetricRepository,
    private readonly insights: BusinessInsightRepository,
    private readonly exports: ReportExportRepository,
  ) {}

  async overview(organizationId: string): Promise<ReportingAnalyticsOverview> {
    const [templates, scheduled, generated, kpis, insights, exports] = await Promise.all([
      this.templates.listByOrganization(organizationId),
      this.scheduled.listByOrganization(organizationId),
      this.generated.listByOrganization(organizationId),
      this.kpis.listByOrganization(organizationId),
      this.insights.listByOrganization(organizationId),
      this.exports.listByOrganization(organizationId),
    ]);

    return {
      templateCount: templates.length,
      scheduledReportCount: scheduled.length,
      generatedReportCount: generated.length,
      kpiCount: kpis.length,
      insightCount: insights.length,
      exportCount: exports.length,
    };
  }
}

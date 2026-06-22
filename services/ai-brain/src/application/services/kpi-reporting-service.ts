import type { KpiMetric } from "../../domain/entities/kpi-metric.js";
import type { KpiMetricRepository } from "../ports.js";
import { AnalyticsEngineService } from "./analytics-engine-service.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class KpiReportingService {
  constructor(
    private readonly kpis: KpiMetricRepository,
    private readonly analytics: AnalyticsEngineService,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async refresh(organizationId: string): Promise<KpiMetric[]> {
    const [analytics, revenue] = await Promise.all([
      this.analytics.overview(organizationId),
      this.revenue.summarize(organizationId),
    ]);
    const now = new Date();
    const metrics: Array<Omit<KpiMetric, "id" | "createdAt" | "updatedAt">> = [
      { organizationId, category: "REVENUE", name: "Pipeline Value", value: revenue.pipelineValue, target: null, unit: "currency", trend: "UP", period: "MONTHLY", measuredAt: now },
      { organizationId, category: "REVENUE", name: "Projected Revenue", value: revenue.projectedRevenue, target: null, unit: "currency", trend: "UP", period: "MONTHLY", measuredAt: now },
      { organizationId, category: "SALES", name: "Win Rate", value: revenue.winRate, target: 0.35, unit: "ratio", trend: "FLAT", period: "MONTHLY", measuredAt: now },
      { organizationId, category: "AI", name: "AI Performance", value: analytics.aiPerformance, target: 80, unit: "score", trend: "FLAT", period: "MONTHLY", measuredAt: now },
      { organizationId, category: "CONVERSION", name: "Lead Conversion", value: analytics.leadConversionRate, target: 0.25, unit: "ratio", trend: "FLAT", period: "MONTHLY", measuredAt: now },
    ];

    await Promise.all(metrics.map((metric) => this.kpis.create(metric)));
    return this.kpis.listByOrganization(organizationId);
  }
}

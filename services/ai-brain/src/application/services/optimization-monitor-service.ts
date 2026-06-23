import type { OptimizationMetric } from "../../domain/entities/optimization-metric.js";
import type { OptimizationEventRepository, OptimizationMetricRepository } from "../ports.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class OptimizationMonitorService {
  constructor(
    private readonly metrics: OptimizationMetricRepository,
    private readonly events: OptimizationEventRepository,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async monitor(organizationId: string): Promise<OptimizationMetric[]> {
    const revenue = await this.revenue.summarize(organizationId);
    const now = new Date();
    const metricInputs: Array<Omit<OptimizationMetric, "id" | "createdAt" | "updatedAt">> = [
      { organizationId, name: "Risk Value", scope: "REVENUE", value: revenue.riskValue, target: 5000, unit: "currency", status: revenue.riskValue > 5000 ? "BREACHED" : "HEALTHY", measuredAt: now },
      { organizationId, name: "Win Rate", scope: "REVENUE", value: revenue.winRate, target: 0.35, unit: "ratio", status: revenue.winRate < 0.25 ? "WATCH" : "HEALTHY", measuredAt: now },
      { organizationId, name: "Expansion Value", scope: "REVENUE", value: revenue.upsellValue + revenue.crossSellValue, target: 10000, unit: "currency", status: "HEALTHY", measuredAt: now },
    ];

    const created = await Promise.all(metricInputs.map((metric) => this.metrics.create(metric)));
    await Promise.all(
      created
        .filter((metric) => metric.status === "BREACHED")
        .map((metric) =>
          this.events.create({
            organizationId,
            type: "KPI_THRESHOLD_BREACHED",
            source: metric.scope,
            message: `${metric.name} breached target ${metric.target}.`,
            severity: "HIGH",
            metadata: { metricId: metric.id, value: metric.value, target: metric.target },
          }),
        ),
    );
    return this.metrics.listByOrganization(organizationId);
  }
}

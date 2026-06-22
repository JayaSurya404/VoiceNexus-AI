import type { TrendAnalysis } from "../../domain/entities/trend-analysis.js";
import type { TrendAnalysisRepository } from "../ports.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class TrendAnalysisService {
  constructor(
    private readonly trends: TrendAnalysisRepository,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async calculate(organizationId: string): Promise<TrendAnalysis[]> {
    const revenue = await this.revenue.summarize(organizationId);
    const now = new Date();
    const values = [
      { label: "Committed", value: revenue.committedRevenue },
      { label: "Weighted", value: revenue.weightedRevenue },
      { label: "Projected", value: revenue.projectedRevenue },
    ];
    const first = values[0]?.value ?? 0;
    const last = values[values.length - 1]?.value ?? 0;
    const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;

    await this.trends.create({
      organizationId,
      metric: "Revenue",
      period: "MONTHLY",
      values,
      changePercent,
      direction: changePercent > 1 ? "UP" : changePercent < -1 ? "DOWN" : "FLAT",
      insight: "Revenue trend compares committed, weighted, and projected pipeline values.",
      computedAt: now,
    });

    return this.trends.listByOrganization(organizationId);
  }
}

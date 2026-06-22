import type { ExecutiveSummary } from "../../domain/entities/executive-summary.js";
import type { ExecutiveSummaryRepository } from "../ports.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class ExecutiveSummaryService {
  constructor(
    private readonly summaries: ExecutiveSummaryRepository,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async generate(organizationId: string): Promise<ExecutiveSummary[]> {
    const revenue = await this.revenue.summarize(organizationId);
    await this.summaries.create({
      organizationId,
      title: "Executive Business Intelligence Summary",
      summary: `Pipeline value is ${Math.round(revenue.pipelineValue)} with projected revenue of ${Math.round(revenue.projectedRevenue)}.`,
      highlights: [`${revenue.openOpportunities} open opportunities`, `${Math.round(revenue.winRate * 100)}% win rate`],
      risks: revenue.riskValue > 0 ? [`${Math.round(revenue.riskValue)} in active deal risk`] : [],
      recommendations: ["Review high-impact insights", "Align weekly forecast and risk review"],
      sourceSections: ["analytics", "revenue", "coaching", "knowledge", "collaboration"],
      generatedAt: new Date(),
    });
    return this.summaries.listByOrganization(organizationId);
  }
}

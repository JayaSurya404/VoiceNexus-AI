import type { BusinessInsight } from "../../domain/entities/business-insight.js";
import type { BusinessInsightRepository } from "../ports.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class BusinessInsightService {
  constructor(
    private readonly insights: BusinessInsightRepository,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async generate(organizationId: string): Promise<BusinessInsight[]> {
    const revenue = await this.revenue.summarize(organizationId);
    await Promise.all([
      this.insights.create({
        organizationId,
        type: "GROWTH_OPPORTUNITY",
        title: "Expansion pipeline",
        message: `Expansion value is ${Math.round(revenue.upsellValue + revenue.crossSellValue)}.`,
        impactScore: Math.min(100, Math.round((revenue.upsellValue + revenue.crossSellValue) / 1000)),
        recommendedActions: ["Prioritize expansion-ready customers", "Assign follow-up owners"],
        metadata: { upsellValue: revenue.upsellValue, crossSellValue: revenue.crossSellValue },
      }),
      this.insights.create({
        organizationId,
        type: "RISK_INDICATOR",
        title: "Pipeline at risk",
        message: `Risk-weighted deal value is ${Math.round(revenue.riskValue)}.`,
        impactScore: Math.min(100, Math.round(revenue.riskValue / 1000)),
        recommendedActions: ["Review high-risk opportunities", "Schedule recovery actions"],
        metadata: { riskValue: revenue.riskValue },
      }),
    ]);
    return this.insights.listByOrganization(organizationId);
  }
}

import type { ExecutiveDashboard } from "../../domain/entities/executive-dashboard.js";
import type { ExecutiveDashboardRepository } from "../ports.js";
import { AnalyticsEngineService } from "./analytics-engine-service.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class ExecutiveDashboardService {
  constructor(
    private readonly dashboards: ExecutiveDashboardRepository,
    private readonly analytics: AnalyticsEngineService,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async getDashboard(organizationId: string): Promise<ExecutiveDashboard> {
    const [analytics, revenue] = await Promise.all([
      this.analytics.overview(organizationId),
      this.revenue.summarize(organizationId),
    ]);

    return this.dashboards.upsert({
      organizationId,
      revenueOverview: { ...revenue },
      salesOverview: { leadConversionRate: analytics.leadConversionRate, qualificationAccuracy: analytics.qualificationAccuracy },
      coachingOverview: { humanPerformance: analytics.humanPerformance },
      knowledgeOverview: { workflowEffectiveness: analytics.workflowEffectiveness },
      agentOverview: { agentProductivity: analytics.agentProductivity },
      aiPerformanceOverview: { aiPerformance: analytics.aiPerformance },
      computedAt: new Date(),
    });
  }
}

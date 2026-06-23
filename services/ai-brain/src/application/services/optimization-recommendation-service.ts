import type { OptimizationRecommendation } from "../../domain/entities/optimization-recommendation.js";
import type { OptimizationMetricRepository, OptimizationRecommendationRepository } from "../ports.js";

export class OptimizationRecommendationService {
  constructor(
    private readonly recommendations: OptimizationRecommendationRepository,
    private readonly metrics: OptimizationMetricRepository,
  ) {}

  async generate(organizationId: string): Promise<OptimizationRecommendation[]> {
    const [existing, metrics] = await Promise.all([
      this.recommendations.listOpenByOrganization(organizationId),
      this.metrics.listByOrganization(organizationId),
    ]);
    const breached = metrics.filter((metric) => metric.status === "BREACHED" || metric.status === "WATCH");

    if (!existing.length) {
      await Promise.all(
        breached.slice(0, 5).map((metric) =>
          this.recommendations.create({
            organizationId,
            type: metric.scope === "REVENUE" ? "REVENUE_RECOVERY" : "SELF_HEALING",
            title: `Optimize ${metric.name}`,
            rationale: `${metric.name} is ${metric.status.toLowerCase()} with value ${metric.value}.`,
            confidence: 0.78,
            expectedImpact: Math.min(100, Math.round(Math.abs(metric.value - metric.target))),
            priority: metric.status === "BREACHED" ? "HIGH" : "MEDIUM",
            status: "OPEN",
          }),
        ),
      );
    }

    return this.recommendations.listByOrganization(organizationId);
  }
}

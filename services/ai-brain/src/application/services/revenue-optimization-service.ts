import type { OptimizationRecommendationRepository } from "../ports.js";

export class RevenueOptimizationService {
  constructor(private readonly recommendations: OptimizationRecommendationRepository) {}

  async recommend(organizationId: string) {
    await this.recommendations.create({
      organizationId,
      type: "REVENUE_RECOVERY",
      title: "Recover high-risk pipeline",
      rationale: "Prioritize high-value opportunities with active risk indicators.",
      confidence: 0.8,
      expectedImpact: 75,
      priority: "HIGH",
      status: "OPEN",
    });
    return this.recommendations.listByOrganization(organizationId);
  }
}

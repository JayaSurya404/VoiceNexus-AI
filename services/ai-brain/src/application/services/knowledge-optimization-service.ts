import type { OptimizationRecommendationRepository } from "../ports.js";

export class KnowledgeOptimizationService {
  constructor(private readonly recommendations: OptimizationRecommendationRepository) {}

  async recommend(organizationId: string) {
    await this.recommendations.create({
      organizationId,
      type: "KNOWLEDGE_IMPROVEMENT",
      title: "Improve low-confidence retrieval areas",
      rationale: "Prioritize unresolved knowledge gaps and failed searches for content improvement.",
      confidence: 0.76,
      expectedImpact: 67,
      priority: "HIGH",
      status: "OPEN",
    });
    return this.recommendations.listByOrganization(organizationId);
  }
}

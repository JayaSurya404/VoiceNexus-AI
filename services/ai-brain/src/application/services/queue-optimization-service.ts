import type { OptimizationRecommendationRepository } from "../ports.js";

export class QueueOptimizationService {
  constructor(private readonly recommendations: OptimizationRecommendationRepository) {}

  async recommend(organizationId: string) {
    await this.recommendations.create({
      organizationId,
      type: "QUEUE_BALANCING",
      title: "Rebalance queue coverage",
      rationale: "Redistribute available agents toward queues with rising wait time.",
      confidence: 0.72,
      expectedImpact: 64,
      priority: "MEDIUM",
      status: "OPEN",
    });
    return this.recommendations.listByOrganization(organizationId);
  }
}

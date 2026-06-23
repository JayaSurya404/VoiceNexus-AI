import type { OptimizationRecommendationRepository } from "../ports.js";

export class WorkflowOptimizationService {
  constructor(private readonly recommendations: OptimizationRecommendationRepository) {}

  async recommend(organizationId: string) {
    await this.recommendations.create({
      organizationId,
      type: "WORKFLOW_TUNING",
      title: "Tune stalled workflows",
      rationale: "Review partial or failed workflows and simplify brittle action paths.",
      confidence: 0.74,
      expectedImpact: 61,
      priority: "MEDIUM",
      status: "OPEN",
    });
    return this.recommendations.listByOrganization(organizationId);
  }
}

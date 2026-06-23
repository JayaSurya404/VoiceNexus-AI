import type { OptimizationRecommendationRepository } from "../ports.js";

export class AgentAllocationService {
  constructor(private readonly recommendations: OptimizationRecommendationRepository) {}

  async recommend(organizationId: string) {
    await this.recommendations.create({
      organizationId,
      type: "AGENT_REALLOCATION",
      title: "Adjust agent allocation",
      rationale: "Move agents with spare capacity toward overloaded demand segments.",
      confidence: 0.7,
      expectedImpact: 58,
      priority: "MEDIUM",
      status: "OPEN",
    });
    return this.recommendations.listByOrganization(organizationId);
  }
}

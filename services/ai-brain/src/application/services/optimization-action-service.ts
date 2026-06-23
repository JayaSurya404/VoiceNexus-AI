import type { OptimizationAction } from "../../domain/entities/optimization-action.js";
import type { OptimizationActionRepository, OptimizationEventRepository, OptimizationRecommendationRepository } from "../ports.js";

export class OptimizationActionService {
  constructor(
    private readonly actions: OptimizationActionRepository,
    private readonly recommendations: OptimizationRecommendationRepository,
    private readonly events: OptimizationEventRepository,
  ) {}

  async createActions(organizationId: string): Promise<OptimizationAction[]> {
    const [actions, recommendations] = await Promise.all([
      this.actions.listByOrganization(organizationId),
      this.recommendations.listOpenByOrganization(organizationId),
    ]);

    if (!actions.length) {
      await Promise.all(
        recommendations.slice(0, 5).map((recommendation) =>
          this.actions.create({
            organizationId,
            recommendationId: recommendation.id,
            scope: recommendation.type === "REVENUE_RECOVERY" ? "REVENUE" : "WORKFLOW",
            title: recommendation.title,
            description: recommendation.rationale,
            status: "PENDING",
            impactScore: recommendation.expectedImpact,
            metadata: { recommendationType: recommendation.type },
          }),
        ),
      );
      await this.events.create({ organizationId, type: "ACTION_CREATED", source: "OPTIMIZATION", message: "Optimization actions created from open recommendations.", severity: "MEDIUM", metadata: {} });
    }

    return this.actions.listByOrganization(organizationId);
  }
}

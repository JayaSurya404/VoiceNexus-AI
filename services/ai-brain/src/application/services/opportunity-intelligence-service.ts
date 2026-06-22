import type { Opportunity } from "../../domain/entities/opportunity.js";
import type { DealStageRepository, OpportunityRepository } from "../ports.js";

export class OpportunityIntelligenceService {
  constructor(
    private readonly opportunities: OpportunityRepository,
    private readonly dealStages: DealStageRepository,
  ) {}

  async list(organizationId: string): Promise<Opportunity[]> {
    return this.opportunities.listByOrganization(organizationId);
  }

  async get(id: string, organizationId: string): Promise<Opportunity | null> {
    const opportunity = await this.opportunities.findById(id);
    return opportunity?.organizationId === organizationId ? opportunity : null;
  }

  async enrichScores(organizationId: string): Promise<Opportunity[]> {
    const [opportunities, stages] = await Promise.all([
      this.opportunities.listOpenByOrganization(organizationId),
      this.dealStages.listByOrganization(organizationId),
    ]);
    const stageProbability = new Map(stages.map((stage) => [stage.name, stage.probability]));

    await Promise.all(
      opportunities.map((opportunity) => {
        const stageScore = Math.round((stageProbability.get(opportunity.stageName) ?? opportunity.probability) * 60);
        const valueScore = Math.min(25, Math.round(opportunity.value / 1000));
        const closeScore = opportunity.expectedCloseDate ? 15 : 5;
        return this.opportunities.update(opportunity.id, organizationId, {
          aiScore: Math.min(100, stageScore + valueScore + closeScore),
        });
      }),
    );

    return this.opportunities.listByOrganization(organizationId);
  }
}

import type { CrossSellOpportunity } from "../../domain/entities/cross-sell-opportunity.js";
import type { UpsellOpportunity } from "../../domain/entities/upsell-opportunity.js";
import type { CrossSellOpportunityRepository, OpportunityRepository, UpsellOpportunityRepository } from "../ports.js";

export class UpsellIntelligenceService {
  constructor(
    private readonly upsells: UpsellOpportunityRepository,
    private readonly crossSells: CrossSellOpportunityRepository,
    private readonly opportunities: OpportunityRepository,
  ) {}

  async identifyUpsell(organizationId: string): Promise<UpsellOpportunity[]> {
    const [opportunities, existing] = await Promise.all([
      this.opportunities.listByOrganization(organizationId),
      this.upsells.listByOrganization(organizationId),
    ]);
    const existingOpportunityIds = new Set(existing.map((item) => item.opportunityId).filter(Boolean));
    const highValue = opportunities.filter((opportunity) => opportunity.status === "WON" && opportunity.value >= 5_000 && !existingOpportunityIds.has(opportunity.id));

    await Promise.all(
      highValue.map((opportunity) =>
        this.upsells.create({
          organizationId,
          customerId: opportunity.leadId,
          opportunityId: opportunity.id,
          product: "Premium expansion",
          estimatedValue: Math.round(opportunity.value * 0.35),
          fitScore: Math.min(100, opportunity.aiScore + 15),
          reasons: ["High-value won customer", "Strong purchase intent", "Expansion-ready account profile"],
          recommendedActions: ["Offer premium tier review", "Share expansion ROI", "Schedule success planning call"],
          status: "OPEN",
        }),
      ),
    );

    return this.upsells.listByOrganization(organizationId);
  }

  async identifyCrossSell(organizationId: string): Promise<CrossSellOpportunity[]> {
    const [opportunities, existing] = await Promise.all([
      this.opportunities.listByOrganization(organizationId),
      this.crossSells.listByOrganization(organizationId),
    ]);
    const existingOpportunityIds = new Set(existing.map((item) => item.opportunityId).filter(Boolean));
    const candidates = opportunities.filter((opportunity) => opportunity.status === "WON" && opportunity.aiScore >= 50 && !existingOpportunityIds.has(opportunity.id));

    await Promise.all(
      candidates.map((opportunity) =>
        this.crossSells.create({
          organizationId,
          customerId: opportunity.leadId,
          opportunityId: opportunity.id,
          product: "Complementary service bundle",
          affinityScore: Math.min(100, opportunity.aiScore + 10),
          estimatedValue: Math.round(opportunity.value * 0.22),
          complementaryServices: ["Implementation support", "Analytics add-on", "Managed follow-up"],
          reasons: ["Customer fit indicates related service need", "Won opportunity has strong signal quality"],
          status: "OPEN",
        }),
      ),
    );

    return this.crossSells.listByOrganization(organizationId);
  }
}

import type {
  CrossSellOpportunityRepository,
  DealRiskRepository,
  OpportunityRepository,
  RevenueAnalyticsSummary,
  UpsellOpportunityRepository,
} from "../ports.js";

export class RevenueAnalyticsService {
  constructor(
    private readonly opportunities: OpportunityRepository,
    private readonly risks: DealRiskRepository,
    private readonly upsells: UpsellOpportunityRepository,
    private readonly crossSells: CrossSellOpportunityRepository,
  ) {}

  async summarize(organizationId: string): Promise<RevenueAnalyticsSummary> {
    const [opportunities, risks, upsells, crossSells] = await Promise.all([
      this.opportunities.listByOrganization(organizationId),
      this.risks.listActiveByOrganization(organizationId),
      this.upsells.listByOrganization(organizationId),
      this.crossSells.listByOrganization(organizationId),
    ]);
    const open = opportunities.filter((opportunity) => opportunity.status === "OPEN");
    const won = opportunities.filter((opportunity) => opportunity.status === "WON");
    const lost = opportunities.filter((opportunity) => opportunity.status === "LOST");
    const pipelineValue = open.reduce((sum, opportunity) => sum + opportunity.value, 0);
    const weightedRevenue = open.reduce((sum, opportunity) => sum + opportunity.value * opportunity.probability, 0);
    const committedRevenue = open.filter((opportunity) => opportunity.probability >= 0.75).reduce((sum, opportunity) => sum + opportunity.value, 0);
    const projectedRevenue = Math.round(weightedRevenue + committedRevenue * 0.15);
    const closedCount = won.length + lost.length;

    return {
      pipelineValue,
      weightedRevenue,
      committedRevenue,
      projectedRevenue,
      openOpportunities: open.length,
      wonRevenue: won.reduce((sum, opportunity) => sum + opportunity.value, 0),
      lostRevenue: lost.reduce((sum, opportunity) => sum + opportunity.value, 0),
      averageDealSize: opportunities.length ? opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0) / opportunities.length : 0,
      winRate: closedCount ? won.length / closedCount : 0,
      riskValue: risks.reduce((sum, risk) => {
        const opportunity = opportunities.find((item) => item.id === risk.opportunityId);
        return sum + (opportunity?.value ?? 0);
      }, 0),
      upsellValue: upsells.reduce((sum, item) => sum + item.estimatedValue, 0),
      crossSellValue: crossSells.reduce((sum, item) => sum + item.estimatedValue, 0),
      topLeadSource: this.topBy(opportunities, (opportunity) => opportunity.source),
      topOwnerId: this.topBy(opportunities, (opportunity) => opportunity.ownerId ?? "UNASSIGNED"),
    };
  }

  private topBy<T>(items: T[], selector: (item: T) => string): string | null {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = selector(item);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }
}

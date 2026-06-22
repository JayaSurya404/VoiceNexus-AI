import type { SalesInsight } from "../../domain/entities/sales-insight.js";
import type { OpportunityRepository, SalesInsightRepository, UpsellOpportunityRepository, DealRiskRepository } from "../ports.js";

export class SalesInsightService {
  constructor(
    private readonly insights: SalesInsightRepository,
    private readonly opportunities: OpportunityRepository,
    private readonly risks: DealRiskRepository,
    private readonly upsells: UpsellOpportunityRepository,
  ) {}

  async generate(organizationId: string): Promise<SalesInsight[]> {
    const [opportunities, risks, upsells] = await Promise.all([
      this.opportunities.listByOrganization(organizationId),
      this.risks.listActiveByOrganization(organizationId),
      this.upsells.listByOrganization(organizationId),
    ]);
    const openPipeline = opportunities.filter((opportunity) => opportunity.status === "OPEN").reduce((sum, opportunity) => sum + opportunity.value, 0);
    const topSource = this.topBy(opportunities, (opportunity) => opportunity.source);
    const topOwner = this.topBy(opportunities, (opportunity) => opportunity.ownerId ?? "UNASSIGNED");

    await Promise.all([
      this.insights.create({
        organizationId,
        type: "PIPELINE_GROWTH",
        title: "Pipeline value",
        message: `Open pipeline is ${Math.round(openPipeline).toLocaleString()}.`,
        value: openPipeline,
        trend: openPipeline > 0 ? "UP" : "FLAT",
        confidence: 0.78,
        metadata: { opportunityCount: opportunities.length },
      }),
      this.insights.create({
        organizationId,
        type: "RISK_CONCENTRATION",
        title: "Deal risk concentration",
        message: `${risks.length} active deal risks require attention.`,
        value: risks.length,
        trend: risks.length > 0 ? "UP" : "FLAT",
        confidence: 0.74,
        metadata: {},
      }),
      this.insights.create({
        organizationId,
        type: "LEAD_SOURCE",
        title: "Highest converting lead source",
        message: topSource ? `${topSource} is the highest-volume lead source.` : "No lead source concentration detected.",
        value: 0,
        trend: "FLAT",
        confidence: 0.7,
        metadata: { topSource },
      }),
      this.insights.create({
        organizationId,
        type: "TOP_AGENT",
        title: "Top performing owner",
        message: topOwner ? `${topOwner} owns the most revenue opportunities.` : "No owner concentration detected.",
        value: 0,
        trend: "FLAT",
        confidence: 0.68,
        metadata: { topOwner },
      }),
      this.insights.create({
        organizationId,
        type: "UPSELL_TREND",
        title: "Upsell opportunity trend",
        message: `${upsells.length} upsell opportunities are available.`,
        value: upsells.length,
        trend: upsells.length > 0 ? "UP" : "FLAT",
        confidence: 0.73,
        metadata: {},
      }),
    ]);

    return this.insights.listByOrganization(organizationId);
  }

  list(organizationId: string): Promise<SalesInsight[]> {
    return this.insights.listByOrganization(organizationId);
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

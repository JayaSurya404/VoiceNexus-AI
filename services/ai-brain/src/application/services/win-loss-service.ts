import type { WinLossAnalysis } from "../../domain/entities/win-loss-analysis.js";
import type { OpportunityRepository, WinLossAnalysisRepository } from "../ports.js";

export class WinLossService {
  constructor(
    private readonly analyses: WinLossAnalysisRepository,
    private readonly opportunities: OpportunityRepository,
  ) {}

  async analyzeOrganization(organizationId: string): Promise<WinLossAnalysis[]> {
    const opportunities = await this.opportunities.listByOrganization(organizationId);
    const closed = opportunities.filter((opportunity) => opportunity.status === "WON" || opportunity.status === "LOST");

    await Promise.all(
      closed.map((opportunity) =>
        this.analyses.upsert({
          organizationId,
          opportunityId: opportunity.id,
          outcome: opportunity.status === "WON" ? "WIN" : "LOSS",
          reason: opportunity.status === "WON" ? "Opportunity closed successfully" : "Opportunity marked lost",
          competitors: [],
          successFactors: opportunity.status === "WON" ? ["Strong fit", "Clear next step", "Qualified buyer"] : [],
          failureFactors: opportunity.status === "LOST" ? ["Low engagement", "Unclear timeline", "Competitive pressure"] : [],
          improvementSuggestions: ["Capture competitor context", "Improve follow-up consistency", "Validate buying committee earlier"],
          analyzedAt: new Date(),
        }),
      ),
    );

    return this.analyses.listByOrganization(organizationId);
  }

  list(organizationId: string): Promise<WinLossAnalysis[]> {
    return this.analyses.listByOrganization(organizationId);
  }
}

import type { DealRisk, DealRiskType } from "../../domain/entities/deal-risk.js";
import type { DealRiskRepository, OpportunityRepository } from "../ports.js";

export class DealRiskService {
  constructor(
    private readonly risks: DealRiskRepository,
    private readonly opportunities: OpportunityRepository,
  ) {}

  async analyzeOrganization(organizationId: string): Promise<DealRisk[]> {
    const [opportunities, existingRisks] = await Promise.all([
      this.opportunities.listOpenByOrganization(organizationId),
      this.risks.listActiveByOrganization(organizationId),
    ]);
    const existing = new Set(existingRisks.map((risk) => `${risk.opportunityId}:${risk.riskType}`));
    const now = new Date();
    const created: DealRisk[] = [];

    for (const opportunity of opportunities) {
      const detected = this.detect(opportunity);

      for (const risk of detected) {
        const key = `${opportunity.id}:${risk.riskType}`;
        if (!existing.has(key)) {
          created.push(
            await this.risks.create({
              organizationId,
              opportunityId: opportunity.id,
              riskType: risk.riskType,
              riskScore: risk.riskScore,
              reasons: risk.reasons,
              recommendedActions: risk.recommendedActions,
              active: true,
              detectedAt: now,
            }),
          );
        }
      }
    }

    return created.length ? this.risks.listActiveByOrganization(organizationId) : existingRisks;
  }

  list(organizationId: string): Promise<DealRisk[]> {
    return this.risks.listByOrganization(organizationId);
  }

  private detect(opportunity: { value: number; probability: number; expectedCloseDate: Date | null; aiScore: number; createdAt: Date }): Array<Pick<DealRisk, "riskType" | "riskScore" | "reasons" | "recommendedActions">> {
    const risks: Array<Pick<DealRisk, "riskType" | "riskScore" | "reasons" | "recommendedActions">> = [];
    const ageDays = Math.floor((Date.now() - opportunity.createdAt.getTime()) / 86_400_000);

    if (ageDays > 30 && opportunity.probability < 0.5) risks.push(this.risk("STALLED_DEAL", 74, "Deal age exceeds 30 days with low probability."));
    if (opportunity.aiScore < 35) risks.push(this.risk("LOW_ENGAGEMENT", 68, "AI score indicates weak buying signals."));
    if (!opportunity.expectedCloseDate) risks.push(this.risk("MISSING_FOLLOW_UP", 62, "Expected close date is missing."));
    if (opportunity.probability < 0.25 && opportunity.value > 10_000) risks.push(this.risk("DECLINING_SENTIMENT", 66, "High-value deal has low conversion probability."));
    if (ageDays > 60) risks.push(this.risk("LONG_SALES_CYCLE", 80, "Sales cycle is longer than normal."));

    return risks;
  }

  private risk(riskType: DealRiskType, riskScore: number, reason: string): Pick<DealRisk, "riskType" | "riskScore" | "reasons" | "recommendedActions"> {
    return {
      riskType,
      riskScore,
      reasons: [reason],
      recommendedActions: ["Schedule a targeted follow-up", "Confirm decision criteria", "Revalidate timeline and next step"],
    };
  }
}

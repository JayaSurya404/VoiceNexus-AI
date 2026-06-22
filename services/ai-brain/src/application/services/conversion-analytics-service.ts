import type { CallOutcomeRepository, ConversionAnalytics, LeadQualificationRepository } from "../ports.js";

export class ConversionAnalyticsService {
  constructor(
    private readonly qualifications: LeadQualificationRepository,
    private readonly outcomes: CallOutcomeRepository,
  ) {}

  async summarize(organizationId: string): Promise<ConversionAnalytics> {
    const [qualifications, outcomes] = await Promise.all([
      this.qualifications.listByOrganization(organizationId),
      this.outcomes.listByOrganization(organizationId),
    ]);
    const convertedLeadIds = new Set(
      outcomes
        .filter((outcome) => outcome.outcome === "SALE" || outcome.outcome === "BOOKED_MEETING")
        .map((outcome) => outcome.leadId)
        .filter((value): value is string => Boolean(value)),
    );
    const hot = qualifications.filter((qualification) => qualification.interestLevel === "HOT");
    const warm = qualifications.filter((qualification) => qualification.interestLevel === "WARM");
    const cold = qualifications.filter((qualification) => qualification.interestLevel === "COLD");

    return {
      hotLeads: hot.length,
      warmLeads: warm.length,
      coldLeads: cold.length,
      hotConversionRate: conversionRate(hot, convertedLeadIds),
      warmConversionRate: conversionRate(warm, convertedLeadIds),
      coldConversionRate: conversionRate(cold, convertedLeadIds),
      overallConversionRate: conversionRate(qualifications, convertedLeadIds),
    };
  }
}

function conversionRate(
  qualifications: Array<{ leadId: string }>,
  convertedLeadIds: Set<string>,
): number {
  return qualifications.length
    ? qualifications.filter((qualification) => convertedLeadIds.has(qualification.leadId)).length / qualifications.length
    : 0;
}

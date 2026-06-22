import type { KnowledgeGapRepository, KnowledgeSuggestionRepository } from "../ports.js";
import type { KnowledgeSuggestion } from "../../domain/entities/knowledge-suggestion.js";

export class KnowledgeSuggestionService {
  constructor(
    private readonly suggestions: KnowledgeSuggestionRepository,
    private readonly gaps: KnowledgeGapRepository,
  ) {}

  async generateForOrganization(organizationId: string): Promise<KnowledgeSuggestion[]> {
    const gaps = (await this.gaps.listByOrganization(organizationId)).filter((gap) => gap.status === "OPEN");
    const existing = await this.suggestions.listByOrganization(organizationId);
    const created: KnowledgeSuggestion[] = [];

    for (const gap of gaps) {
      if (existing.some((suggestion) => suggestion.gapId === gap.id && suggestion.status === "PENDING")) continue;
      const type = gap.escalationCount > gap.unansweredCount ? "SOP_UPDATE" : "FAQ_ENTRY";
      created.push(await this.suggestions.create({
        organizationId,
        gapId: gap.id,
        type,
        title: `${type === "SOP_UPDATE" ? "SOP update" : "FAQ entry"}: ${gap.topic}`,
        content: `Draft answer or procedure for ${gap.topic}. Include prerequisites, recommended response, escalation criteria, and source documentation.`,
        rationale: `Generated from ${gap.triggerCount} learning signals with severity ${Math.round(gap.severityScore)}.`,
        confidence: Math.max(0.35, Math.min(0.9, gap.severityScore / 100)),
        status: "PENDING",
        reviewedBy: null,
        reviewedAt: null,
      }));
    }

    return created.length ? created : existing;
  }

  approve(id: string, organizationId: string, reviewedBy: string | null): Promise<KnowledgeSuggestion | null> {
    return this.suggestions.updateStatus(id, organizationId, { status: "APPROVED", reviewedBy, reviewedAt: new Date() });
  }

  reject(id: string, organizationId: string, reviewedBy: string | null): Promise<KnowledgeSuggestion | null> {
    return this.suggestions.updateStatus(id, organizationId, { status: "REJECTED", reviewedBy, reviewedAt: new Date() });
  }
}

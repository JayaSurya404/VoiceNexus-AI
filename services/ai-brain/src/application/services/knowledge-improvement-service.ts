import type {
  KnowledgeChunkRepository,
  KnowledgeFeedbackRepository,
  KnowledgeGapRepository,
  KnowledgeImprovementRepository,
  KnowledgeSearchRepository,
  KnowledgeSuggestionRepository,
} from "../ports.js";
import type { KnowledgeImprovement } from "../../domain/entities/knowledge-improvement.js";

export class KnowledgeImprovementService {
  constructor(
    private readonly improvements: KnowledgeImprovementRepository,
    private readonly chunks: KnowledgeChunkRepository,
    private readonly searches: KnowledgeSearchRepository,
    private readonly feedback: KnowledgeFeedbackRepository,
    private readonly gaps: KnowledgeGapRepository,
    private readonly suggestions: KnowledgeSuggestionRepository,
  ) {}

  async scoreOrganization(organizationId: string): Promise<KnowledgeImprovement> {
    const [chunks, searches, feedback, gaps, suggestions] = await Promise.all([
      this.chunks.listByOrganization(organizationId),
      this.searches.listByOrganization(organizationId),
      this.feedback.listByOrganization(organizationId),
      this.gaps.listByOrganization(organizationId),
      this.suggestions.listByOrganization(organizationId),
    ]);
    const helpful = feedback.filter((item) => item.type === "HELPFUL" || item.retrievalUsage === "HELPFUL").length;
    const unhelpful = feedback.filter((item) => item.type === "UNHELPFUL" || item.retrievalUsage === "UNHELPFUL").length;
    const retrievalSuccessRate = searches.length
      ? searches.filter((search) => search.confidence >= 0.55 && search.resultChunkIds.length > 0).length / searches.length
      : 0;
    const openGaps = gaps.filter((gap) => gap.status === "OPEN" || gap.status === "IN_REVIEW");
    const gapSeverityScore = openGaps.length
      ? openGaps.reduce((total, gap) => total + gap.severityScore, 0) / openGaps.length
      : 0;
    const knowledgeQualityScore = Math.max(0, Math.min(100, 65 + helpful * 4 - unhelpful * 6 - gapSeverityScore * 0.25));
    const coverageScore = Math.max(0, Math.min(100, chunks.length * 2 + retrievalSuccessRate * 45 - openGaps.length * 5));

    return this.improvements.create({
      organizationId,
      knowledgeQualityScore,
      coverageScore,
      retrievalSuccessRate,
      gapSeverityScore,
      feedbackCount: feedback.length,
      openGapCount: openGaps.length,
      suggestionCount: suggestions.length,
      computedAt: new Date(),
    });
  }
}

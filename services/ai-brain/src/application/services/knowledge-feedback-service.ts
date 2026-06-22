import type { KnowledgeFeedbackRepository } from "../ports.js";
import type { KnowledgeFeedback, KnowledgeFeedbackType, KnowledgeRetrievalUsage } from "../../domain/entities/knowledge-feedback.js";
import type { KnowledgeLearningService } from "./knowledge-learning-service.js";

export class KnowledgeFeedbackService {
  constructor(
    private readonly feedback: KnowledgeFeedbackRepository,
    private readonly learning: KnowledgeLearningService,
  ) {}

  async create(input: {
    organizationId: string;
    searchId?: string | null;
    citationId?: string | null;
    conversationId?: string | null;
    agentSessionId?: string | null;
    chunkId?: string | null;
    type: KnowledgeFeedbackType;
    retrievalUsage: KnowledgeRetrievalUsage;
    rating?: number | null;
    comment?: string | null;
    createdBy?: string | null;
  }): Promise<KnowledgeFeedback> {
    const created = await this.feedback.create({
      organizationId: input.organizationId,
      searchId: input.searchId ?? null,
      citationId: input.citationId ?? null,
      conversationId: input.conversationId ?? null,
      agentSessionId: input.agentSessionId ?? null,
      chunkId: input.chunkId ?? null,
      type: input.type,
      retrievalUsage: input.retrievalUsage,
      rating: input.rating ?? null,
      comment: input.comment ?? null,
      createdBy: input.createdBy ?? null,
      createdAt: new Date(),
    });

    if (input.type === "UNHELPFUL" || input.type === "FAILED_SEARCH" || input.type === "LOW_CONFIDENCE_RESPONSE") {
      await this.learning.record({
        organizationId: input.organizationId,
        sourceConversationId: input.conversationId ?? null,
        sourceSessionId: input.agentSessionId ?? null,
        searchId: input.searchId ?? null,
        topic: input.comment ?? input.type,
        confidence: input.rating ? input.rating / 5 : 0.25,
        triggerReason: input.type === "FAILED_SEARCH" ? "FAILED_SEARCH" : "UNHELPFUL_FEEDBACK",
        metadata: { feedbackId: created.id, retrievalUsage: input.retrievalUsage },
      });
    }

    if (input.type === "HELPFUL") {
      await this.learning.record({
        organizationId: input.organizationId,
        sourceConversationId: input.conversationId ?? null,
        sourceSessionId: input.agentSessionId ?? null,
        searchId: input.searchId ?? null,
        topic: input.comment ?? "helpful knowledge response",
        confidence: input.rating ? input.rating / 5 : 0.85,
        triggerReason: "HELPFUL_FEEDBACK",
        metadata: { feedbackId: created.id, retrievalUsage: input.retrievalUsage },
      });
    }

    return created;
  }
}

import type { KnowledgeLearningEventRepository } from "../ports.js";
import type { KnowledgeLearningEvent, KnowledgeLearningTrigger } from "../../domain/entities/knowledge-learning-event.js";

export class KnowledgeLearningService {
  constructor(private readonly learningEvents: KnowledgeLearningEventRepository) {}

  record(input: {
    organizationId: string;
    sourceConversationId?: string | null;
    sourceSessionId?: string | null;
    searchId?: string | null;
    topic: string;
    confidence: number;
    triggerReason: KnowledgeLearningTrigger;
    metadata?: Record<string, unknown>;
  }): Promise<KnowledgeLearningEvent> {
    return this.learningEvents.create({
      organizationId: input.organizationId,
      sourceConversationId: input.sourceConversationId ?? null,
      sourceSessionId: input.sourceSessionId ?? null,
      searchId: input.searchId ?? null,
      topic: normalizeTopic(input.topic),
      confidence: input.confidence,
      triggerReason: input.triggerReason,
      metadata: input.metadata ?? {},
      createdAt: new Date(),
    });
  }
}

function normalizeTopic(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160) || "unknown";
}

import type { RagContextPackage } from "../ports.js";
import type { CitationService } from "./citation-service.js";
import type { KnowledgeSearchService } from "./knowledge-search-service.js";
import type { KnowledgeLearningService } from "./knowledge-learning-service.js";

export interface RagRuntimeInput {
  organizationId: string;
  query: string;
  transcript?: string | null;
  crmContext?: Record<string, unknown>;
  memoryContext?: Record<string, unknown>;
  conversationId?: string | null;
  agentSessionId?: string | null;
}

export class RagRuntimeService {
  constructor(
    private readonly knowledgeSearch: KnowledgeSearchService,
    private readonly citationService: CitationService,
    private readonly learningService?: KnowledgeLearningService,
  ) {}

  async buildContext(input: RagRuntimeInput): Promise<RagContextPackage> {
    const result = await this.knowledgeSearch.search({
      organizationId: input.organizationId,
      query: input.query,
      transcript: input.transcript ?? null,
      crmContext: input.crmContext ?? {},
      memoryContext: input.memoryContext ?? {},
    });
    if (this.learningService && (result.confidence < 0.45 || result.chunks.length === 0)) {
      await this.learningService.record({
        organizationId: input.organizationId,
        sourceConversationId: input.conversationId ?? null,
        sourceSessionId: input.agentSessionId ?? null,
        searchId: result.search.id,
        topic: input.query,
        confidence: result.confidence,
        triggerReason: result.chunks.length === 0 ? "FAILED_SEARCH" : "LOW_RETRIEVAL_CONFIDENCE",
        metadata: { chunkCount: result.chunks.length },
      });
    }
    const citations = await this.citationService.createForChunks({
      organizationId: input.organizationId,
      searchId: result.search.id,
      conversationId: input.conversationId ?? null,
      agentSessionId: input.agentSessionId ?? null,
      chunks: result.chunks,
      confidence: result.confidence,
    });

    return {
      query: input.query,
      chunks: result.chunks,
      citations,
      confidence: result.confidence,
      contextText: result.chunks
        .map((chunk, index) => `[Knowledge ${index + 1}] ${chunk.content}`)
        .join("\n\n"),
    };
  }
}

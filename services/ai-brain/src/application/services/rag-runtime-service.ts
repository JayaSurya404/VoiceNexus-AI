import type { RagContextPackage } from "../ports.js";
import type { CitationService } from "./citation-service.js";
import type { KnowledgeSearchService } from "./knowledge-search-service.js";

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
  ) {}

  async buildContext(input: RagRuntimeInput): Promise<RagContextPackage> {
    const result = await this.knowledgeSearch.search({
      organizationId: input.organizationId,
      query: input.query,
      transcript: input.transcript ?? null,
      crmContext: input.crmContext ?? {},
      memoryContext: input.memoryContext ?? {},
    });
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

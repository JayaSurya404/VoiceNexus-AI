import type { KnowledgeCitationRepository } from "../ports.js";
import type { KnowledgeChunk } from "../../domain/entities/knowledge-chunk.js";
import type { KnowledgeCitation } from "../../domain/entities/knowledge-citation.js";

export interface CreateCitationsInput {
  organizationId: string;
  searchId: string | null;
  conversationId?: string | null;
  agentSessionId?: string | null;
  chunks: KnowledgeChunk[];
  confidence: number;
}

export class CitationService {
  constructor(private readonly citations: KnowledgeCitationRepository) {}

  createForChunks(input: CreateCitationsInput): Promise<KnowledgeCitation[]> {
    return this.citations.createMany(
      input.chunks.map((chunk) => ({
        organizationId: input.organizationId,
        searchId: input.searchId,
        conversationId: input.conversationId ?? null,
        agentSessionId: input.agentSessionId ?? null,
        documentId: chunk.documentId,
        chunkId: chunk.id,
        quote: chunk.content.slice(0, 500),
        relevanceScore: input.confidence,
        createdAt: new Date(),
      })),
    );
  }
}

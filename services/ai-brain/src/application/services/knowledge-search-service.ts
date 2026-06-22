import type {
  KnowledgeChunkRepository,
  KnowledgeSearchRepository,
} from "../ports.js";
import type { KnowledgeChunk } from "../../domain/entities/knowledge-chunk.js";
import type { KnowledgeSearch } from "../../domain/entities/knowledge-search.js";
import type { EmbeddingService } from "./embedding-service.js";

export interface KnowledgeSearchInput {
  organizationId: string;
  query: string;
  transcript?: string | null;
  crmContext?: Record<string, unknown>;
  memoryContext?: Record<string, unknown>;
  limit?: number;
}

export interface KnowledgeSearchResult {
  search: KnowledgeSearch;
  chunks: KnowledgeChunk[];
  confidence: number;
}

export class KnowledgeSearchService {
  constructor(
    private readonly chunks: KnowledgeChunkRepository,
    private readonly searches: KnowledgeSearchRepository,
    private readonly embeddings: EmbeddingService,
  ) {}

  async search(input: KnowledgeSearchInput): Promise<KnowledgeSearchResult> {
    const queryEmbedding = await this.embeddings.embed(input.query);
    const chunks = await this.chunks.listByOrganization(input.organizationId);
    const ranked = chunks
      .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, input.limit ?? 5);
    const selectedChunks = ranked.map((item) => item.chunk);
    const confidence = ranked.length
      ? ranked.reduce((total, item) => total + Math.max(0, item.score), 0) / ranked.length
      : 0;
    const search = await this.searches.create({
      organizationId: input.organizationId,
      query: input.query,
      transcript: input.transcript ?? null,
      crmContext: input.crmContext ?? {},
      memoryContext: input.memoryContext ?? {},
      resultChunkIds: selectedChunks.map((chunk) => chunk.id),
      confidence,
      createdAt: new Date(),
    });
    return { search, chunks: selectedChunks, confidence };
  }
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (!left.length || !right.length || left.length !== right.length) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }
  return leftMagnitude && rightMagnitude ? dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)) : 0;
}

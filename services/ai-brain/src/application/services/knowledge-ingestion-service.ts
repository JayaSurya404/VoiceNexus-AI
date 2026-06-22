import { createHash } from "node:crypto";

import type {
  KnowledgeBaseRepository,
  KnowledgeChunkRepository,
  KnowledgeDocumentRepository,
} from "../ports.js";
import type { KnowledgeDocument, KnowledgeDocumentType } from "../../domain/entities/knowledge-document.js";
import type { ChunkingService } from "./chunking-service.js";
import type { DocumentParserService } from "./document-parser-service.js";
import type { EmbeddingService } from "./embedding-service.js";

export interface KnowledgeUploadInput {
  organizationId: string;
  knowledgeBaseId?: string | null;
  title: string;
  sourceName: string;
  documentType: KnowledgeDocumentType;
  content: string;
  encoding?: "text" | "base64";
  uploadedBy?: string | null;
  metadata?: Record<string, unknown>;
}

export class KnowledgeIngestionService {
  constructor(
    private readonly knowledgeBases: KnowledgeBaseRepository,
    private readonly documents: KnowledgeDocumentRepository,
    private readonly chunks: KnowledgeChunkRepository,
    private readonly parser: DocumentParserService,
    private readonly chunker: ChunkingService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async upload(input: KnowledgeUploadInput): Promise<KnowledgeDocument> {
    const knowledgeBase = input.knowledgeBaseId
      ? await this.knowledgeBases.findById(input.knowledgeBaseId)
      : await this.ensureDefaultKnowledgeBase(input.organizationId, input.uploadedBy ?? null);
    if (!knowledgeBase || knowledgeBase.organizationId !== input.organizationId) {
      throw new Error("Knowledge base not found");
    }

    const document = await this.documents.create({
      organizationId: input.organizationId,
      knowledgeBaseId: knowledgeBase.id,
      title: input.title,
      documentType: input.documentType,
      status: "UPLOADED",
      sourceName: input.sourceName,
      contentHash: hashContent(input.content),
      metadata: input.metadata ?? {},
      error: null,
      chunkCount: 0,
      uploadedBy: input.uploadedBy ?? null,
    });

    try {
      const text = this.parser.parse({
        documentType: input.documentType,
        content: input.content,
        encoding: input.encoding ?? "text",
      });
      await this.documents.update(document.id, input.organizationId, { status: "PARSED" });
      const textChunks = this.chunker.chunk({ text });
      await this.documents.update(document.id, input.organizationId, { status: "CHUNKED", chunkCount: textChunks.length });
      const vectors = await this.embeddings.embedMany(textChunks.map((chunk) => chunk.content));
      await this.chunks.deleteByDocument(input.organizationId, document.id);
      await this.chunks.createMany(
        textChunks.map((chunk, index) => ({
          organizationId: input.organizationId,
          knowledgeBaseId: knowledgeBase.id,
          documentId: document.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          embedding: vectors[index] ?? [],
          metadata: { sourceName: input.sourceName, title: input.title },
        })),
      );
      return await this.documents.update(document.id, input.organizationId, { status: "EMBEDDED", chunkCount: textChunks.length }) ?? document;
    } catch (error) {
      return await this.documents.update(document.id, input.organizationId, {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Knowledge ingestion failed",
      }) ?? document;
    }
  }

  private async ensureDefaultKnowledgeBase(organizationId: string, createdBy: string | null) {
    const existing = await this.knowledgeBases.findDefault(organizationId);
    if (existing) return existing;
    return this.knowledgeBases.create({
      organizationId,
      name: "Default Knowledge Base",
      description: "Primary organization knowledge base",
      active: true,
      createdBy,
    });
  }
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

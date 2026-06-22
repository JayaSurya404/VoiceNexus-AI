export interface KnowledgeChunk {
  id: string;
  organizationId: string;
  knowledgeBaseId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

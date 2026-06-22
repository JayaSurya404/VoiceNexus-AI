export interface KnowledgeSearch {
  id: string;
  organizationId: string;
  query: string;
  transcript: string | null;
  crmContext: Record<string, unknown>;
  memoryContext: Record<string, unknown>;
  resultChunkIds: string[];
  confidence: number;
  createdAt: Date;
}

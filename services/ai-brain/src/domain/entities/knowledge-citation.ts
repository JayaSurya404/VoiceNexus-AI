export interface KnowledgeCitation {
  id: string;
  organizationId: string;
  searchId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  documentId: string;
  chunkId: string;
  quote: string;
  relevanceScore: number;
  createdAt: Date;
}

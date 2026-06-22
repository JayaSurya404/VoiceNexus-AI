export type KnowledgeFeedbackType =
  | "HELPFUL"
  | "UNHELPFUL"
  | "ESCALATED_CALL"
  | "HUMAN_TAKEOVER"
  | "LOW_CONFIDENCE_RESPONSE"
  | "FAILED_SEARCH";

export type KnowledgeRetrievalUsage = "RETRIEVED" | "USED" | "IGNORED" | "HELPFUL" | "UNHELPFUL";

export interface KnowledgeFeedback {
  id: string;
  organizationId: string;
  searchId: string | null;
  citationId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  chunkId: string | null;
  type: KnowledgeFeedbackType;
  retrievalUsage: KnowledgeRetrievalUsage;
  rating: number | null;
  comment: string | null;
  createdBy: string | null;
  createdAt: Date;
}

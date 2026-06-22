export type KnowledgeSuggestionType = "FAQ_ENTRY" | "SOP_UPDATE" | "KNOWLEDGE_ARTICLE" | "MISSING_DOCUMENTATION";
export type KnowledgeSuggestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface KnowledgeSuggestion {
  id: string;
  organizationId: string;
  gapId: string | null;
  type: KnowledgeSuggestionType;
  title: string;
  content: string;
  rationale: string;
  confidence: number;
  status: KnowledgeSuggestionStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

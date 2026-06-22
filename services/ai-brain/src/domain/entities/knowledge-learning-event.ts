export type KnowledgeLearningTrigger =
  | "LOW_RETRIEVAL_CONFIDENCE"
  | "FAILED_SEARCH"
  | "UNHELPFUL_FEEDBACK"
  | "HELPFUL_FEEDBACK"
  | "ESCALATION"
  | "HUMAN_TAKEOVER";

export interface KnowledgeLearningEvent {
  id: string;
  organizationId: string;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  searchId: string | null;
  topic: string;
  confidence: number;
  triggerReason: KnowledgeLearningTrigger;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

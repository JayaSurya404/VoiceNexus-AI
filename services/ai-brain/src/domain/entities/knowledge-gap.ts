export type KnowledgeGapStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";

export interface KnowledgeGap {
  id: string;
  organizationId: string;
  topic: string;
  description: string;
  triggerCount: number;
  unansweredCount: number;
  escalationCount: number;
  averageConfidence: number;
  severityScore: number;
  status: KnowledgeGapStatus;
  sourceSearchIds: string[];
  sourceConversationIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

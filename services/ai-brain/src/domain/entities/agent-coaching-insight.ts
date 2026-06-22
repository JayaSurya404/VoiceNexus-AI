export type CoachingInsightType =
  | "OBJECTION_HANDLING"
  | "DISCOVERY_QUESTION"
  | "CLOSING_SUGGESTION"
  | "FOLLOW_UP"
  | "ESCALATION";

export interface AgentCoachingInsight {
  id: string;
  organizationId: string;
  coachingSessionId: string | null;
  agentId: string | null;
  conversationId: string | null;
  type: CoachingInsightType;
  message: string;
  reasoning: string;
  confidence: number;
  accepted: boolean | null;
  createdAt: Date;
}

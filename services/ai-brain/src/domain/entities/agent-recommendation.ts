export type AgentRecommendationType = "ASK_QUESTION" | "SCHEDULE_MEETING" | "SEND_FOLLOW_UP" | "ESCALATE" | "TRANSFER" | "CLOSE_OPPORTUNITY";

export interface AgentRecommendation {
  id: string;
  organizationId: string;
  coachingSessionId: string | null;
  agentId: string | null;
  conversationId: string | null;
  type: AgentRecommendationType;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  used: boolean;
  confidence: number;
  createdAt: Date;
}

export type NextBestActionType = "ASK_QUESTION" | "SCHEDULE_MEETING" | "SEND_FOLLOW_UP" | "ESCALATE" | "TRANSFER" | "CLOSE_OPPORTUNITY";

export interface NextBestAction {
  id: string;
  organizationId: string;
  coachingSessionId: string | null;
  agentId: string | null;
  conversationId: string | null;
  actionType: NextBestActionType;
  label: string;
  rationale: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  completed: boolean;
  confidence: number;
  createdAt: Date;
}

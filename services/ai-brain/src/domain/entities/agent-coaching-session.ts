export type AgentCoachingSessionStatus = "ACTIVE" | "COMPLETED" | "ESCALATED";

export interface AgentCoachingSession {
  id: string;
  organizationId: string;
  agentId: string | null;
  humanSessionId: string | null;
  aiSessionId: string | null;
  callId: string | null;
  conversationId: string | null;
  status: AgentCoachingSessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentCollaborationSessionStatus = "ACTIVE" | "REVIEW" | "COMPLETED" | "FAILED";

export interface AgentCollaborationSession {
  id: string;
  organizationId: string;
  teamId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  primaryAgentId: string | null;
  status: AgentCollaborationSessionStatus;
  customerRequest: string;
  finalResponse: string | null;
  averageConfidence: number;
  resolutionQuality: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

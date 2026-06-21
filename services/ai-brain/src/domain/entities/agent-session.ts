export type AgentSessionStatus = "ACTIVE" | "PAUSED" | "TRANSFERRED" | "COMPLETED" | "FAILED";

export interface AgentSession {
  id: string;
  organizationId: string;
  agentPersonaId: string;
  leadId: string | null;
  callId: string | null;
  aiConversationId: string | null;
  status: AgentSessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  lastTranscriptAt: Date | null;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

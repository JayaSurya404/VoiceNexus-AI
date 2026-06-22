export type HumanAgentSessionStatus = "JOINED" | "ACTIVE" | "ENDED";
export type SessionController = "AI" | "HUMAN" | "SUPERVISOR";

export interface HumanAgentSession {
  id: string;
  organizationId: string;
  agentId: string;
  aiSessionId: string | null;
  callId: string | null;
  leadId: string | null;
  status: HumanAgentSessionStatus;
  controller: SessionController;
  joinedAt: Date;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

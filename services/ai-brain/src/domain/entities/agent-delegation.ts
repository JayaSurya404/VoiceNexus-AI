export type AgentDelegationStatus = "REQUESTED" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "FAILED";

export interface AgentDelegation {
  id: string;
  organizationId: string;
  collaborationSessionId: string | null;
  taskId: string;
  sourceAgentId: string | null;
  targetAgentId: string | null;
  task: string;
  status: AgentDelegationStatus;
  reasoning: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

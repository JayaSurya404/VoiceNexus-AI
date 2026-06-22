import type { CollaborativeAgentType } from "./agent-team.js";

export type AgentTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface AgentTask {
  id: string;
  organizationId: string;
  collaborationSessionId: string | null;
  teamId: string | null;
  assignedAgentId: string | null;
  assignedAgentType: CollaborativeAgentType;
  title: string;
  description: string;
  status: AgentTaskStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

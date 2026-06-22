import type { HumanAgentStatus } from "./agent.js";

export interface AgentAvailability {
  id: string;
  organizationId: string;
  agentId: string;
  status: HumanAgentStatus;
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  updatedAt: Date;
}

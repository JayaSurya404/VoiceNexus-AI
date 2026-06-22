export type HumanAgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
export type HumanAgentRole = "AGENT" | "SUPERVISOR" | "MANAGER";

export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: HumanAgentRole;
  status: HumanAgentStatus;
  activeSessionId: string | null;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

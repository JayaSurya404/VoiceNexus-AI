export type CollaborativeAgentType =
  | "SalesAgent"
  | "SupportAgent"
  | "TechnicalAgent"
  | "SchedulerAgent"
  | "QAAgent"
  | "SupervisorAgent";

export interface TeamAgent {
  agentId: string;
  type: CollaborativeAgentType;
  role: string;
  active: boolean;
}

export interface AgentTeam {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  agents: TeamAgent[];
  objectives: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

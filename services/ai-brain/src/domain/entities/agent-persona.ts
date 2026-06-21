export type AgentPersonaRole = "SALES_AGENT" | "SUPPORT_AGENT" | "APPOINTMENT_SETTER" | "COLLECTIONS_AGENT";

export interface AgentPersona {
  id: string;
  organizationId: string;
  name: string;
  role: AgentPersonaRole;
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

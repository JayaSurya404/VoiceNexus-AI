export const AGENT_SKILLS = [
  "SALES",
  "SUPPORT",
  "TECHNICAL",
  "BILLING",
  "RETENTION",
] as const;

export type KnownAgentSkillName = (typeof AGENT_SKILLS)[number];
export type AgentSkillName = KnownAgentSkillName | (string & {});

export interface AgentSkill {
  id: string;
  organizationId: string;
  agentId: string;
  skill: AgentSkillName;
  level: number;
  certified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import type {
  AgentPersonaRole,
  AgentRole,
  AgentRuntimeStatus,
  AgentStatus,
  AgentVoiceProvider,
} from "@voicenexus/contracts";

export interface AgentWorkspace {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: AgentRole;
  status: AgentStatus;
  runtimeStatus: AgentRuntimeStatus;
  activeSessionId: string | null;
  skills: string[];
  personaId: string | null;
  voiceProvider: AgentVoiceProvider;
  voiceId: string;
  knowledgeBaseIds: string[];
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewAgentWorkspace = Omit<AgentWorkspace, "id" | "createdAt" | "updatedAt">;
export type AgentWorkspaceUpdate = Partial<Omit<NewAgentWorkspace, "organizationId">>;

export interface AgentPersonaWorkspace {
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

export type NewAgentPersonaWorkspace = Omit<AgentPersonaWorkspace, "id" | "createdAt" | "updatedAt">;
export type AgentPersonaWorkspaceUpdate = Partial<Omit<NewAgentPersonaWorkspace, "organizationId">>;

export interface AgentSkillWorkspace {
  id: string;
  organizationId: string;
  agentId: string;
  skill: string;
  level: number;
  certified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewAgentSkillWorkspace = Omit<AgentSkillWorkspace, "id" | "createdAt" | "updatedAt">;
export type AgentSkillWorkspaceUpdate = Partial<Omit<NewAgentSkillWorkspace, "organizationId" | "agentId">>;

export interface AgentAvailabilitySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
}

export interface AgentAvailabilityWorkspace {
  id: string;
  organizationId: string;
  agentId: string;
  status: AgentStatus;
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  schedule: AgentAvailabilitySchedule[];
  updatedAt: Date;
}

export type NewAgentAvailabilityWorkspace = Omit<AgentAvailabilityWorkspace, "id">;

export interface AgentPerformanceWorkspace {
  id: string;
  organizationId: string;
  agentId: string;
  callsHandled: number;
  averageDuration: number;
  averageQaScore: number;
  averageSentiment: number;
  transfers: number;
  conversions: number;
  leadQuality: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

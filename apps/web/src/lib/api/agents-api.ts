import type {
  AgentAvailabilityWorkspaceDto,
  AgentDashboardDto,
  AgentDetailsDto,
  AgentPerformanceWorkspaceDto,
  AgentPersonaWorkspaceDto,
  AgentSkillWorkspaceDto,
  AgentStatus,
  AgentTestResultDto,
  AgentWorkspaceDto,
  CreateAgentInput,
  CreateAgentPersonaInput,
  CreateAgentSkillInput,
  TestAgentInput,
  UpdateAgentInput,
  UpdateAgentPersonaInput,
  UpdateAgentSkillInput,
  UpsertAgentAvailabilityInput,
} from "@voicenexus/contracts";

import { apiFetch } from "./client";

export interface AgentListParams {
  organizationId: string;
  search?: string;
  status?: AgentStatus | "";
}

function query(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  return searchParams.toString();
}

export const agentsApi = {
  dashboard: (organizationId: string) => apiFetch<AgentDashboardDto>(`/agents/dashboard?${query({ organizationId })}`),
  list: (params: AgentListParams) => apiFetch<AgentWorkspaceDto[]>(`/agents?${query({ ...params })}`),
  create: (input: CreateAgentInput) => apiFetch<AgentWorkspaceDto>("/agents", { method: "POST", body: JSON.stringify(input) }),
  details: (id: string, organizationId: string) => apiFetch<AgentDetailsDto>(`/agents/${id}?${query({ organizationId })}`),
  update: (id: string, input: UpdateAgentInput) => apiFetch<AgentWorkspaceDto>(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  delete: (id: string, organizationId: string) => apiFetch<void>(`/agents/${id}?${query({ organizationId })}`, { method: "DELETE" }),
  personas: (organizationId: string) => apiFetch<AgentPersonaWorkspaceDto[]>(`/agents/personas?${query({ organizationId })}`),
  createPersona: (input: CreateAgentPersonaInput) => apiFetch<AgentPersonaWorkspaceDto>("/agents/personas", { method: "POST", body: JSON.stringify(input) }),
  updatePersona: (id: string, input: UpdateAgentPersonaInput) => apiFetch<AgentPersonaWorkspaceDto>(`/agents/personas/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  skills: (organizationId: string, agentId?: string) => apiFetch<AgentSkillWorkspaceDto[]>(`/agents/skills?${query({ organizationId, agentId })}`),
  createSkill: (input: CreateAgentSkillInput) => apiFetch<AgentSkillWorkspaceDto>("/agents/skills", { method: "POST", body: JSON.stringify(input) }),
  updateSkill: (id: string, input: UpdateAgentSkillInput) => apiFetch<AgentSkillWorkspaceDto>(`/agents/skills/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  availability: (organizationId: string) => apiFetch<AgentAvailabilityWorkspaceDto[]>(`/agents/availability?${query({ organizationId })}`),
  upsertAvailability: (input: UpsertAgentAvailabilityInput) => apiFetch<AgentAvailabilityWorkspaceDto>("/agents/availability", { method: "POST", body: JSON.stringify(input) }),
  performance: (organizationId: string) => apiFetch<AgentPerformanceWorkspaceDto[]>(`/agents/performance?${query({ organizationId })}`),
  test: (input: TestAgentInput) => apiFetch<AgentTestResultDto>("/agents/test", { method: "POST", body: JSON.stringify(input) }),
};

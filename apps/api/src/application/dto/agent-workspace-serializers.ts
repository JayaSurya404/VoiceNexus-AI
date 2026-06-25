import type {
  AgentAvailabilityWorkspaceDto,
  AgentDashboardDto,
  AgentDetailsDto,
  AgentPerformanceWorkspaceDto,
  AgentPersonaWorkspaceDto,
  AgentSkillWorkspaceDto,
  AgentTestResultDto,
  AgentWorkspaceDto,
} from "@voicenexus/contracts";

import type {
  AgentAvailabilityWorkspace,
  AgentPerformanceWorkspace,
  AgentPersonaWorkspace,
  AgentSkillWorkspace,
  AgentWorkspace,
} from "../../domain/entities/agent-workspace.js";

export function toAgentDto(agent: AgentWorkspace): AgentWorkspaceDto {
  return {
    id: agent.id,
    organizationId: agent.organizationId,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    status: agent.status,
    runtimeStatus: agent.runtimeStatus,
    activeSessionId: agent.activeSessionId,
    skills: agent.skills,
    personaId: agent.personaId,
    voice: { provider: agent.voiceProvider, voiceId: agent.voiceId },
    knowledgeBaseIds: agent.knowledgeBaseIds,
    prompt: agent.prompt,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export function toAgentPersonaDto(persona: AgentPersonaWorkspace): AgentPersonaWorkspaceDto {
  return {
    id: persona.id,
    organizationId: persona.organizationId,
    name: persona.name,
    role: persona.role,
    systemPrompt: persona.systemPrompt,
    tone: persona.tone,
    goals: persona.goals,
    constraints: persona.constraints,
    isDefault: persona.isDefault,
    createdAt: persona.createdAt.toISOString(),
    updatedAt: persona.updatedAt.toISOString(),
  };
}

export function toAgentSkillDto(skill: AgentSkillWorkspace): AgentSkillWorkspaceDto {
  return {
    id: skill.id,
    organizationId: skill.organizationId,
    agentId: skill.agentId,
    skill: skill.skill,
    level: skill.level,
    certified: skill.certified,
    active: skill.active,
    createdAt: skill.createdAt.toISOString(),
    updatedAt: skill.updatedAt.toISOString(),
  };
}

export function toAgentAvailabilityDto(availability: AgentAvailabilityWorkspace): AgentAvailabilityWorkspaceDto {
  return {
    id: availability.id,
    organizationId: availability.organizationId,
    agentId: availability.agentId,
    status: availability.status,
    statusReason: availability.statusReason,
    capacity: availability.capacity,
    activeSessionCount: availability.activeSessionCount,
    schedule: availability.schedule,
    updatedAt: availability.updatedAt.toISOString(),
  };
}

export function toAgentPerformanceDto(performance: AgentPerformanceWorkspace): AgentPerformanceWorkspaceDto {
  return {
    id: performance.id,
    organizationId: performance.organizationId,
    agentId: performance.agentId,
    callsHandled: performance.callsHandled,
    averageDuration: performance.averageDuration,
    averageQaScore: performance.averageQaScore,
    averageSentiment: performance.averageSentiment,
    transfers: performance.transfers,
    conversions: performance.conversions,
    leadQuality: performance.leadQuality,
    computedAt: performance.computedAt.toISOString(),
    createdAt: performance.createdAt.toISOString(),
    updatedAt: performance.updatedAt.toISOString(),
  };
}

export function toAgentDetailsDto(input: {
  agent: AgentWorkspace;
  persona: AgentPersonaWorkspace | null;
  skills: AgentSkillWorkspace[];
  availability: AgentAvailabilityWorkspace | null;
  performance: AgentPerformanceWorkspace | null;
}): AgentDetailsDto {
  return {
    agent: toAgentDto(input.agent),
    persona: input.persona ? toAgentPersonaDto(input.persona) : null,
    skills: input.skills.map(toAgentSkillDto),
    availability: input.availability ? toAgentAvailabilityDto(input.availability) : null,
    performance: input.performance ? toAgentPerformanceDto(input.performance) : null,
  };
}

export function toAgentDashboardDto(input: AgentDashboardDto): AgentDashboardDto {
  return input;
}

export function toAgentTestResultDto(input: AgentTestResultDto): AgentTestResultDto {
  return input;
}

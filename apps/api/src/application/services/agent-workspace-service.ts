import type {
  AgentDashboardDto,
  AgentDetailsDto,
  AgentPerformanceWorkspaceDto,
  AgentPersonaWorkspaceDto,
  AgentSkillWorkspaceDto,
  AgentTestResultDto,
  AgentWorkspaceDto,
  CreateAgentPayload,
  CreateAgentPersonaPayload,
  CreateAgentSkillPayload,
  ListAgentsPayload,
  TestAgentPayload,
  UpdateAgentPayload,
  UpdateAgentPersonaPayload,
  UpdateAgentSkillPayload,
  UpsertAgentAvailabilityPayload,
} from "@voicenexus/contracts";

import {
  toAgentAvailabilityDto,
  toAgentDashboardDto,
  toAgentDetailsDto,
  toAgentDto,
  toAgentPerformanceDto,
  toAgentPersonaDto,
  toAgentSkillDto,
  toAgentTestResultDto,
} from "../dto/agent-workspace-serializers.js";
import type {
  AgentAvailabilityWorkspaceRepository,
  AgentPerformanceWorkspaceRepository,
  AgentPersonaWorkspaceRepository,
  AgentSkillWorkspaceRepository,
  AgentWorkspaceRepository,
  OrganizationMemberRepository,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class AgentWorkspaceService {
  constructor(
    private readonly agents: AgentWorkspaceRepository,
    private readonly personas: AgentPersonaWorkspaceRepository,
    private readonly skills: AgentSkillWorkspaceRepository,
    private readonly availability: AgentAvailabilityWorkspaceRepository,
    private readonly performance: AgentPerformanceWorkspaceRepository,
    private readonly members: OrganizationMemberRepository,
  ) {}

  async dashboard(actor: AuthenticatedActor, organizationId: string): Promise<AgentDashboardDto> {
    await this.ensureAccess(actor, organizationId);
    const [agents, personas, skills, performance] = await Promise.all([
      this.agents.listByOrganization({ organizationId }),
      this.personas.listByOrganization(organizationId),
      this.skills.listByOrganization(organizationId),
      this.performance.listByOrganization(organizationId),
    ]);
    const averageQaScore = performance.length
      ? Math.round(performance.reduce((sum, item) => sum + item.averageQaScore, 0) / performance.length)
      : 0;
    return toAgentDashboardDto({
      totalAgents: agents.length,
      availableAgents: agents.filter((agent) => agent.status === "AVAILABLE").length,
      activeAgents: agents.filter((agent) => agent.runtimeStatus === "ACTIVE" || agent.status === "BUSY").length,
      personas: personas.length,
      skills: skills.filter((skill) => skill.active).length,
      averageQaScore,
    });
  }

  async listAgents(actor: AuthenticatedActor, query: ListAgentsPayload): Promise<AgentWorkspaceDto[]> {
    await this.ensureAccess(actor, query.organizationId);
    return (await this.agents.listByOrganization(query)).map(toAgentDto);
  }

  async createAgent(actor: AuthenticatedActor, input: CreateAgentPayload): Promise<AgentWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    if (input.personaId) await this.requirePersona(input.organizationId, input.personaId);
    const agent = await this.agents.create({
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      role: input.role,
      status: "OFFLINE",
      runtimeStatus: "READY",
      activeSessionId: null,
      skills: input.skills,
      personaId: input.personaId,
      voiceProvider: input.voiceProvider,
      voiceId: input.voiceId,
      knowledgeBaseIds: input.knowledgeBaseIds,
      prompt: input.prompt,
    });
    await this.availability.upsert({
      organizationId: input.organizationId,
      agentId: agent.id,
      status: "OFFLINE",
      statusReason: null,
      capacity: 1,
      activeSessionCount: 0,
      schedule: [],
      updatedAt: new Date(),
    });
    await Promise.all(input.skills.map((skill) => this.skills.create({
      organizationId: input.organizationId,
      agentId: agent.id,
      skill,
      level: 3,
      certified: false,
      active: true,
    })));
    return toAgentDto(agent);
  }

  async updateAgent(actor: AuthenticatedActor, agentId: string, input: UpdateAgentPayload): Promise<AgentWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    if (input.personaId) await this.requirePersona(input.organizationId, input.personaId);
    const { organizationId: _organizationId, voiceProvider, voiceId, ...rest } = input;
    const agent = await this.agents.updateForOrganization(agentId, input.organizationId, {
      ...rest,
      ...(voiceProvider ? { voiceProvider } : {}),
      ...(voiceId !== undefined ? { voiceId } : {}),
    });
    if (!agent) throw AppError.notFound("Agent");
    return toAgentDto(agent);
  }

  async deleteAgent(actor: AuthenticatedActor, organizationId: string, agentId: string): Promise<void> {
    await this.ensureAccess(actor, organizationId);
    if (!(await this.agents.deleteForOrganization(agentId, organizationId))) throw AppError.notFound("Agent");
  }

  async details(actor: AuthenticatedActor, organizationId: string, agentId: string): Promise<AgentDetailsDto> {
    await this.ensureAccess(actor, organizationId);
    const agent = await this.requireAgent(organizationId, agentId);
    const [persona, skills, availability, performance] = await Promise.all([
      agent.personaId ? this.personas.findByIdForOrganization(agent.personaId, organizationId) : null,
      this.skills.listByOrganization(organizationId, agentId),
      this.availability.findByAgent(organizationId, agentId),
      this.performance.findByAgent(organizationId, agentId),
    ]);
    return toAgentDetailsDto({ agent, persona, skills, availability, performance });
  }

  async listPersonas(actor: AuthenticatedActor, organizationId: string): Promise<AgentPersonaWorkspaceDto[]> {
    await this.ensureAccess(actor, organizationId);
    return (await this.personas.listByOrganization(organizationId)).map(toAgentPersonaDto);
  }

  async createPersona(actor: AuthenticatedActor, input: CreateAgentPersonaPayload): Promise<AgentPersonaWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    const persona = await this.personas.create(input);
    return toAgentPersonaDto(persona);
  }

  async updatePersona(actor: AuthenticatedActor, id: string, input: UpdateAgentPersonaPayload): Promise<AgentPersonaWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    const { organizationId: _organizationId, ...changes } = input;
    const persona = await this.personas.updateForOrganization(id, input.organizationId, changes);
    if (!persona) throw AppError.notFound("Agent persona");
    return toAgentPersonaDto(persona);
  }

  async listSkills(actor: AuthenticatedActor, organizationId: string, agentId?: string): Promise<AgentSkillWorkspaceDto[]> {
    await this.ensureAccess(actor, organizationId);
    return (await this.skills.listByOrganization(organizationId, agentId)).map(toAgentSkillDto);
  }

  async createSkill(actor: AuthenticatedActor, input: CreateAgentSkillPayload): Promise<AgentSkillWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    await this.requireAgent(input.organizationId, input.agentId);
    const skill = await this.skills.create(input);
    return toAgentSkillDto(skill);
  }

  async updateSkill(actor: AuthenticatedActor, id: string, input: UpdateAgentSkillPayload): Promise<AgentSkillWorkspaceDto> {
    await this.ensureAccess(actor, input.organizationId);
    const { organizationId: _organizationId, ...changes } = input;
    const skill = await this.skills.updateForOrganization(id, input.organizationId, changes);
    if (!skill) throw AppError.notFound("Agent skill");
    return toAgentSkillDto(skill);
  }

  async listAvailability(actor: AuthenticatedActor, organizationId: string) {
    await this.ensureAccess(actor, organizationId);
    return (await this.availability.listByOrganization(organizationId)).map(toAgentAvailabilityDto);
  }

  async upsertAvailability(actor: AuthenticatedActor, input: UpsertAgentAvailabilityPayload) {
    await this.ensureAccess(actor, input.organizationId);
    await this.requireAgent(input.organizationId, input.agentId);
    const availability = await this.availability.upsert({
      organizationId: input.organizationId,
      agentId: input.agentId,
      status: input.status,
      statusReason: input.statusReason,
      capacity: input.capacity,
      activeSessionCount: 0,
      schedule: input.schedule,
      updatedAt: new Date(),
    });
    await this.agents.updateForOrganization(input.agentId, input.organizationId, { status: input.status });
    return toAgentAvailabilityDto(availability);
  }

  async listPerformance(actor: AuthenticatedActor, organizationId: string): Promise<AgentPerformanceWorkspaceDto[]> {
    await this.ensureAccess(actor, organizationId);
    return (await this.performance.listByOrganization(organizationId)).map(toAgentPerformanceDto);
  }

  async testAgent(actor: AuthenticatedActor, input: TestAgentPayload): Promise<AgentTestResultDto> {
    await this.ensureAccess(actor, input.organizationId);
    const agent = await this.requireAgent(input.organizationId, input.agentId);
    const persona = agent.personaId ? await this.personas.findByIdForOrganization(agent.personaId, input.organizationId) : null;
    await this.agents.updateForOrganization(agent.id, input.organizationId, { runtimeStatus: "TESTING" });
    const basePrompt = (persona?.systemPrompt ?? agent.prompt).trim() || "I am ready to help.";
    const response = [
      basePrompt,
      `Customer said: ${input.message}`,
      input.crmContext ? `CRM context considered: ${input.crmContext}` : "",
      input.memoryContext ? `Memory context considered: ${input.memoryContext}` : "",
    ].filter(Boolean).join("\n\n");
    await this.agents.updateForOrganization(agent.id, input.organizationId, { runtimeStatus: "READY" });
    return toAgentTestResultDto({
      agentId: agent.id,
      organizationId: input.organizationId,
      input: input.message,
      response,
      runtimeStatus: "READY",
      confidence: persona ? 0.86 : 0.72,
      usedPersonaId: agent.personaId,
      usedKnowledgeBaseIds: agent.knowledgeBaseIds,
      createdAt: new Date().toISOString(),
    });
  }

  private async requireAgent(organizationId: string, agentId: string) {
    const agent = await this.agents.findByIdForOrganization(agentId, organizationId);
    if (!agent) throw AppError.notFound("Agent");
    return agent;
  }

  private async requirePersona(organizationId: string, personaId: string) {
    const persona = await this.personas.findByIdForOrganization(personaId, organizationId);
    if (!persona) throw AppError.notFound("Agent persona");
    return persona;
  }

  private async ensureAccess(actor: AuthenticatedActor, organizationId: string): Promise<void> {
    if (actor.platformRole === "SUPER_ADMIN") return;
    const membership = await this.members.findByUserAndOrganization(actor.userId, organizationId);
    if (!membership || membership.status !== "ACTIVE") {
      throw AppError.forbidden("You do not have access to this organization");
    }
  }
}

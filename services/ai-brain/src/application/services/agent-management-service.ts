import type { AgentAvailabilityRepository, HumanAgentRepository, HumanAgentSessionRepository } from "../ports.js";
import type { Agent, HumanAgentRole, HumanAgentStatus } from "../../domain/entities/agent.js";
import type { HumanConsoleEventService } from "./human-console-event-service.js";

export class AgentManagementService {
  constructor(
    private readonly agents: HumanAgentRepository,
    private readonly availability: AgentAvailabilityRepository,
    private readonly sessions: HumanAgentSessionRepository,
    private readonly events: HumanConsoleEventService,
  ) {}

  async create(input: {
    organizationId: string;
    name: string;
    email: string;
    role: HumanAgentRole;
    skills: string[];
  }): Promise<Agent> {
    const agent = await this.agents.create({
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      role: input.role,
      status: "OFFLINE",
      activeSessionId: null,
      skills: input.skills,
    });
    await this.availability.upsert({
      organizationId: input.organizationId,
      agentId: agent.id,
      status: "OFFLINE",
      statusReason: null,
      capacity: 1,
      activeSessionCount: 0,
      updatedAt: new Date(),
    });
    return agent;
  }

  async setAvailability(input: {
    organizationId: string;
    agentId: string;
    status: HumanAgentStatus;
    statusReason?: string | null;
    capacity?: number;
  }) {
    const agent = await this.agents.update(input.agentId, input.organizationId, { status: input.status });
    const activeSessionCount = (await this.sessions.listByOrganization(input.organizationId)).filter(
      (session) => session.agentId === input.agentId && session.status !== "ENDED",
    ).length;
    const availability = await this.availability.upsert({
      organizationId: input.organizationId,
      agentId: input.agentId,
      status: input.status,
      statusReason: input.statusReason ?? null,
      capacity: input.capacity ?? 1,
      activeSessionCount,
      updatedAt: new Date(),
    });
    return { agent, availability };
  }

  async joinSession(input: {
    organizationId: string;
    agentId: string;
    aiSessionId?: string | null;
    callId?: string | null;
    leadId?: string | null;
  }) {
    const session = await this.sessions.create({
      organizationId: input.organizationId,
      agentId: input.agentId,
      aiSessionId: input.aiSessionId ?? null,
      callId: input.callId ?? null,
      leadId: input.leadId ?? null,
      status: "JOINED",
      controller: "AI",
      joinedAt: new Date(),
      leftAt: null,
    });
    await this.agents.update(input.agentId, input.organizationId, { status: "BUSY", activeSessionId: session.id });
    await this.events.publish("agent.joined", {
      organizationId: input.organizationId,
      sessionId: session.id,
      payload: { agentId: input.agentId, sessionId: session.id },
    });
    return session;
  }

  async leaveSession(input: { organizationId: string; sessionId: string }) {
    const session = await this.sessions.findById(input.sessionId);
    if (!session || session.organizationId !== input.organizationId) return null;
    const updated = await this.sessions.update(session.id, { status: "ENDED", leftAt: new Date(), controller: "AI" });
    await this.agents.update(session.agentId, input.organizationId, { status: "AVAILABLE", activeSessionId: null });
    await this.events.publish("agent.left", {
      organizationId: input.organizationId,
      sessionId: session.id,
      payload: { agentId: session.agentId, sessionId: session.id },
    });
    return updated;
  }
}

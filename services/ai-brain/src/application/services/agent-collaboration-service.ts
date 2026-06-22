import type {
  AgentCollaborationDecisionRepository,
  AgentCollaborationSessionRepository,
  AgentTaskRepository,
  AgentTeamRepository,
  CollaborationMetrics,
} from "../ports.js";
import type { AgentCollaborationSession } from "../../domain/entities/agent-collaboration-session.js";
import type { AgentTask } from "../../domain/entities/agent-task.js";
import type { AgentTeam, CollaborativeAgentType, TeamAgent } from "../../domain/entities/agent-team.js";
import type { AgentDelegationService } from "./agent-delegation-service.js";
import type { AgentSupervisorService } from "./agent-supervisor-service.js";
import type { RagRuntimeService } from "./rag-runtime-service.js";

export interface CollaborationRuntimeInput {
  organizationId: string;
  teamId?: string | null;
  conversationId?: string | null;
  agentSessionId?: string | null;
  primaryAgentId?: string | null;
  customerRequest: string;
  crmContext?: Record<string, unknown>;
  memoryContext?: Record<string, unknown>;
}

export class AgentCollaborationService {
  constructor(
    private readonly sessions: AgentCollaborationSessionRepository,
    private readonly teams: AgentTeamRepository,
    private readonly tasks: AgentTaskRepository,
    private readonly decisions: AgentCollaborationDecisionRepository,
    private readonly delegationService: AgentDelegationService,
    private readonly supervisorService: AgentSupervisorService,
    private readonly ragRuntime: RagRuntimeService,
  ) {}

  async collaborate(input: CollaborationRuntimeInput): Promise<AgentCollaborationSession> {
    const team = input.teamId ? await this.teams.findById(input.teamId) : await this.defaultTeam(input.organizationId);
    const primaryAgent = team?.agents.find((agent) => agent.agentId === input.primaryAgentId) ?? team?.agents.find((agent) => agent.active) ?? null;
    const specialist = selectSpecialist(team, input.customerRequest);
    const supervisor = team?.agents.find((agent) => agent.type === "SupervisorAgent" && agent.active) ?? null;
    const session = await this.sessions.create({
      organizationId: input.organizationId,
      teamId: team?.id ?? null,
      conversationId: input.conversationId ?? null,
      agentSessionId: input.agentSessionId ?? null,
      primaryAgentId: input.primaryAgentId ?? primaryAgent?.agentId ?? null,
      status: "ACTIVE",
      customerRequest: input.customerRequest,
      finalResponse: null,
      averageConfidence: 0,
      resolutionQuality: 0,
      startedAt: new Date(),
      completedAt: null,
    });

    const task = await this.tasks.create({
      organizationId: input.organizationId,
      collaborationSessionId: session.id,
      teamId: team?.id ?? null,
      assignedAgentId: specialist?.agentId ?? null,
      assignedAgentType: specialist?.type ?? "SupportAgent",
      title: `Specialist response for ${topicFrom(input.customerRequest)}`,
      description: input.customerRequest,
      status: "IN_PROGRESS",
      input: { customerRequest: input.customerRequest, crmContext: input.crmContext ?? {}, memoryContext: input.memoryContext ?? {} },
      output: {},
      confidence: 0,
    });

    await this.delegationService.delegate({
      organizationId: input.organizationId,
      collaborationSessionId: session.id,
      taskId: task.id,
      sourceAgentId: input.primaryAgentId ?? primaryAgent?.agentId ?? null,
      targetAgentId: specialist?.agentId ?? null,
      task: task.description,
      status: "ACCEPTED",
      reasoning: `Primary agent delegated ${topicFrom(input.customerRequest)} to ${specialist?.type ?? "SupportAgent"}.`,
      confidence: 0.72,
    });

    const knowledge = await this.ragRuntime.buildContext({
      organizationId: input.organizationId,
      query: input.customerRequest,
      crmContext: input.crmContext ?? {},
      memoryContext: input.memoryContext ?? {},
      conversationId: input.conversationId ?? null,
      agentSessionId: input.agentSessionId ?? null,
    });
    const specialistResult = await this.tasks.update(task.id, input.organizationId, {
      status: knowledge.confidence >= 0.35 ? "COMPLETED" : "FAILED",
      output: {
        answer: knowledge.contextText || "No specialist knowledge was retrieved.",
        citationCount: knowledge.citations.length,
        chunkCount: knowledge.chunks.length,
      },
      confidence: knowledge.confidence,
    });
    const completedTasks = [specialistResult ?? task];

    await this.decisions.create({
      organizationId: input.organizationId,
      collaborationSessionId: session.id,
      decisionType: "SPECIALIST_RESULT",
      agentId: specialist?.agentId ?? null,
      reasoning: "Specialist agent returned a knowledge-backed result.",
      confidence: knowledge.confidence,
      approved: knowledge.confidence >= 0.35,
      metadata: { taskId: task.id, citationCount: knowledge.citations.length },
      createdAt: new Date(),
    });

    const finalResponse = buildFinalResponse(input.customerRequest, completedTasks);
    const review = await this.supervisorService.review({
      organizationId: input.organizationId,
      collaborationSessionId: session.id,
      supervisorAgentId: supervisor?.agentId ?? null,
      tasks: completedTasks,
      finalResponse,
    });
    await this.decisions.create({
      organizationId: input.organizationId,
      collaborationSessionId: session.id,
      decisionType: "FINAL_APPROVAL",
      agentId: supervisor?.agentId ?? null,
      reasoning: review.approved ? "Final response approved." : "Final response completed with supervisor caveats.",
      confidence: review.confidence,
      approved: review.approved,
      metadata: { finalResponse },
      createdAt: new Date(),
    });

    return await this.sessions.update(session.id, input.organizationId, {
      status: review.approved ? "COMPLETED" : "REVIEW",
      finalResponse,
      averageConfidence: review.confidence,
      resolutionQuality: Number(review.metadata.resolutionQuality ?? 0),
      completedAt: review.approved ? new Date() : null,
    }) ?? session;
  }

  list(organizationId: string): Promise<AgentCollaborationSession[]> {
    return this.sessions.listByOrganization(organizationId);
  }

  async get(id: string, organizationId: string): Promise<AgentCollaborationSession | null> {
    const session = await this.sessions.findById(id);
    return session?.organizationId === organizationId ? session : null;
  }

  async metrics(organizationId: string): Promise<CollaborationMetrics> {
    const [sessions, delegations] = await Promise.all([
      this.sessions.listByOrganization(organizationId),
      this.delegationService.list(organizationId),
    ]);
    return {
      delegationCount: delegations.length,
      collaborationSuccessRate: sessions.length
        ? sessions.filter((session) => session.status === "COMPLETED").length / sessions.length
        : 0,
      averageConfidence: average(sessions.map((session) => session.averageConfidence)),
      resolutionQuality: average(sessions.map((session) => session.resolutionQuality)),
    };
  }

  private async defaultTeam(organizationId: string): Promise<AgentTeam | null> {
    return (await this.teams.listByOrganization(organizationId)).find((team) => team.active) ?? null;
  }
}

function selectSpecialist(team: AgentTeam | null, request: string): TeamAgent | null {
  const text = request.toLowerCase();
  const preferredType: CollaborativeAgentType =
    text.includes("technical") || text.includes("bug") || text.includes("error")
      ? "TechnicalAgent"
      : text.includes("schedule") || text.includes("meeting") || text.includes("appointment")
        ? "SchedulerAgent"
        : text.includes("price") || text.includes("buy") || text.includes("sales")
          ? "SalesAgent"
          : "SupportAgent";
  return team?.agents.find((agent) => agent.active && agent.type === preferredType) ?? team?.agents.find((agent) => agent.active) ?? null;
}

function topicFrom(request: string): string {
  return request.trim().split(/\s+/).slice(0, 8).join(" ") || "customer request";
}

function buildFinalResponse(request: string, tasks: AgentTask[]): string {
  const completed = tasks.find((task) => task.status === "COMPLETED");
  const answer = typeof completed?.output.answer === "string" ? completed.output.answer : null;
  return answer
    ? `Based on specialist review for "${topicFrom(request)}": ${answer}`
    : `I reviewed the request "${topicFrom(request)}" with the specialist team and recommend escalating for human review.`;
}

function average(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length ? filtered.reduce((total, value) => total + value, 0) / filtered.length : 0;
}

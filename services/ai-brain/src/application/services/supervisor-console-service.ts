import type {
  AgentAvailabilityRepository,
  AgentDecisionRepository,
  AgentSessionRepository,
  HumanAgentRepository,
  HumanAgentSessionRepository,
  LeadQualificationRepository,
  LiveTakeoverRepository,
  SupervisorOverview,
  WorkflowExecutionRepository,
} from "../ports.js";
import type { RoutingEngineService } from "./routing-engine-service.js";

export class SupervisorConsoleService {
  constructor(
    private readonly agents: HumanAgentRepository,
    private readonly availability: AgentAvailabilityRepository,
    private readonly humanSessions: HumanAgentSessionRepository,
    private readonly aiSessions: AgentSessionRepository,
    private readonly takeovers: LiveTakeoverRepository,
    private readonly decisions: AgentDecisionRepository,
    private readonly qualifications: LeadQualificationRepository,
    private readonly workflows: WorkflowExecutionRepository,
    private readonly routingEngine: RoutingEngineService,
  ) {}

  async overview(organizationId: string): Promise<SupervisorOverview> {
    const [
      humanSessions,
      aiSessions,
      takeovers,
      _decisions,
      qualifications,
      workflows,
      availability,
      queueHealth,
    ] = await Promise.all([
      this.humanSessions.listByOrganization(organizationId),
      this.aiSessions.listByOrganization(organizationId),
      this.takeovers.listByOrganization(organizationId),
      this.decisions.listByOrganization(organizationId, 200),
      this.qualifications.listByOrganization(organizationId),
      this.workflows.listByOrganization(organizationId),
      this.availability.listByOrganization(organizationId),
      this.routingEngine.queueHealth(organizationId),
    ]);

    const activeAiSessions = aiSessions.filter(
      (session) => session.status === "ACTIVE",
    ).length;

    return {
      activeCalls: humanSessions.filter(
        (session) => session.status !== "ENDED",
      ).length,

      activeAgents: availability.filter(
        (agent) =>
          agent.status === "AVAILABLE" ||
          agent.status === "BUSY",
      ).length,

      activeAiSessions,

      activeTakeovers: takeovers.filter(
        (takeover) => takeover.status === "ACTIVE",
      ).length,

      averageAiConfidence: aiSessions.length
        ? aiSessions.reduce(
            (total, session) => total + session.confidence,
            0,
          ) / aiSessions.length
        : 0,

      averageWaitTime: queueHealth.length
        ? queueHealth.reduce((total, queue) => total + queue.averageWaitTime, 0) /
          queueHealth.length
        : 0,

      hotQualifications: qualifications.filter(
        (qualification) => qualification.interestLevel === "HOT",
      ).length,

      queuedSessions: queueHealth.reduce(
        (total, queue) => total + queue.waiting,
        0,
      ),

      runningWorkflows: workflows.filter(
        (workflow) =>
          workflow.status === "RUNNING" ||
          workflow.status === "PLANNED",
      ).length,
    };
  }

  activeAgents(organizationId: string) {
    return this.agents.listByOrganization(organizationId);
  }
}

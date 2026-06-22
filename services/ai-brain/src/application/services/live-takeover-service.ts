import type { HumanAgentSessionRepository, LiveTakeoverRepository } from "../ports.js";
import type { HumanConsoleEventService } from "./human-console-event-service.js";

export class LiveTakeoverService {
  constructor(
    private readonly takeovers: LiveTakeoverRepository,
    private readonly sessions: HumanAgentSessionRepository,
    private readonly events: HumanConsoleEventService,
  ) {}

  async request(input: {
    organizationId: string;
    sessionId: string;
    agentId: string;
    supervisorId?: string | null;
    reason: string;
  }) {
    return this.takeovers.create({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      agentId: input.agentId,
      supervisorId: input.supervisorId ?? null,
      status: "REQUESTED",
      reason: input.reason,
      requestedAt: new Date(),
      approvedAt: null,
      startedAt: null,
      endedAt: null,
      returnedToAiAt: null,
      metadata: { aiMode: "OBSERVE_PENDING" },
    });
  }

  async approve(id: string) {
    return this.takeovers.update(id, { status: "APPROVED", approvedAt: new Date(), metadata: { aiMode: "OBSERVE_APPROVED" } });
  }

  async start(id: string) {
    const takeover = await this.takeovers.findById(id);
    if (!takeover) return null;
    const started = await this.takeovers.update(id, {
      status: "ACTIVE",
      approvedAt: takeover.approvedAt ?? new Date(),
      startedAt: new Date(),
      metadata: { ...takeover.metadata, aiMode: "OBSERVE" },
    });
    await this.sessions.update(takeover.sessionId, { status: "ACTIVE", controller: "HUMAN" });
    await this.events.publish("takeover.started", {
      organizationId: takeover.organizationId,
      sessionId: takeover.sessionId,
      payload: { takeoverId: takeover.id, agentId: takeover.agentId, aiMode: "OBSERVE" },
    });
    return started;
  }

  async end(id: string, returnToAi = true) {
    const takeover = await this.takeovers.findById(id);
    if (!takeover) return null;
    const ended = await this.takeovers.update(id, {
      status: "ENDED",
      endedAt: new Date(),
      returnedToAiAt: returnToAi ? new Date() : null,
      metadata: { ...takeover.metadata, aiMode: returnToAi ? "ACTIVE" : "OBSERVE_ENDED" },
    });
    await this.sessions.update(takeover.sessionId, { controller: returnToAi ? "AI" : "HUMAN" });
    await this.events.publish("takeover.ended", {
      organizationId: takeover.organizationId,
      sessionId: takeover.sessionId,
      payload: { takeoverId: takeover.id, agentId: takeover.agentId, returnToAi },
    });
    return ended;
  }

  async isAiObserveMode(input: { organizationId: string; aiSessionId: string }): Promise<boolean> {
    const sessions = await this.sessions.listByOrganization(input.organizationId);
    const humanSession = sessions.find(
      (session) => session.aiSessionId === input.aiSessionId && session.status !== "ENDED",
    );
    if (!humanSession) return false;
    const takeovers = await this.takeovers.listByOrganization(input.organizationId);
    return takeovers.some((takeover) => takeover.sessionId === humanSession.id && takeover.status === "ACTIVE");
  }
}

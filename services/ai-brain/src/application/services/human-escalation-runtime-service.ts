import type { CallRuntimeSession } from "../../domain/entities/runtime-orchestration.js";
import type { MongoRuntimeSessionRepository } from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { RuntimeIncidentService } from "./runtime-incident-service.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";

export interface RuntimeEscalationInput {
  organizationId: string;
  sessionId: string;
  reason: string;
  queueId?: string;
  agentId?: string;
  supervisorId?: string;
}

export class HumanEscalationRuntimeService {
  public constructor(
    private readonly sessions: MongoRuntimeSessionRepository,
    private readonly incidents: RuntimeIncidentService,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async escalate(input: RuntimeEscalationInput): Promise<CallRuntimeSession> {
    const session = await this.sessions.updateStatus(input.organizationId, input.sessionId, "ESCALATING", {
      ...(input.queueId ? { activeQueueId: input.queueId } : {}),
      ...(input.agentId ? { activeAgentId: input.agentId } : {}),
      ...(input.supervisorId ? { escalationId: input.supervisorId } : {})
    });

    if (!session) {
      await this.incidents.create({
        organizationId: input.organizationId,
        sessionId: input.sessionId,
        severity: "MEDIUM",
        category: "ROUTING",
        message: "Escalation requested for unknown runtime session"
      });
      throw new Error("Runtime session not found");
    }

    await this.realtime.publish(input.organizationId, "runtime.escalation.started", {
      session,
      reason: input.reason
    });

    if (input.agentId) {
      const assigned = await this.sessions.updateStatus(input.organizationId, input.sessionId, "HUMAN_ASSIGNED", {
        activeAgentId: input.agentId,
        ...(input.queueId ? { activeQueueId: input.queueId } : {})
      });
      if (assigned) {
        await this.realtime.publish(input.organizationId, "runtime.escalation.assigned", { session: assigned });
        return assigned;
      }
    }

    return session;
  }
}

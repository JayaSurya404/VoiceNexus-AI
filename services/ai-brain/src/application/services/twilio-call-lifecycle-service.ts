import type {
  CallRuntimeSession,
  RuntimeCallStatus,
  RuntimeSessionStatus
} from "../../domain/entities/runtime-orchestration.js";
import type { MongoRuntimeSessionRepository } from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { RuntimeIncidentService } from "./runtime-incident-service.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";
import type { TwilioIntegrationService } from "./twilio-integration-service.js";

export interface TwilioLifecycleInput {
  organizationId: string;
  payload: Record<string, unknown>;
}

export class TwilioCallLifecycleService {
  public constructor(
    private readonly sessions: MongoRuntimeSessionRepository,
    private readonly twilio: TwilioIntegrationService,
    private readonly incidents: RuntimeIncidentService,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async processEvent(input: TwilioLifecycleInput): Promise<{
    callStatus: RuntimeCallStatus;
    session: CallRuntimeSession | null;
  }> {
    const event = this.twilio.parseVoiceWebhook(input.payload);
    const runtimeStatus = this.toRuntimeStatus(event.callStatus);
    const sessionStatus = this.toSessionStatus(runtimeStatus);
    const session = event.callSid
      ? await this.sessions.findByCallSid(input.organizationId, event.callSid)
      : null;

    const updatedSession =
      session && sessionStatus
        ? await this.sessions.updateStatus(input.organizationId, session.id, sessionStatus, {
            ...(sessionStatus === "COMPLETED" || sessionStatus === "FAILED" ? { completedAt: new Date() } : {})
          })
        : session;

    if (runtimeStatus === "FAILED") {
      await this.incidents.create({
        organizationId: input.organizationId,
        ...(session ? { sessionId: session.id } : {}),
        severity: "HIGH",
        category: "TWILIO",
        message: `Twilio call failed for ${event.callSid || "unknown call"}`
      });
    }

    await this.realtime.publish(input.organizationId, "runtime.twilio.lifecycle", {
      callStatus: runtimeStatus,
      event,
      session: updatedSession
    });

    return { callStatus: runtimeStatus, session: updatedSession };
  }

  private toRuntimeStatus(callStatus: string): RuntimeCallStatus {
    const normalized = callStatus.toLowerCase();
    if (normalized === "completed") return "COMPLETED";
    if (normalized === "failed" || normalized === "busy" || normalized === "no-answer" || normalized === "canceled") return "FAILED";
    if (normalized === "in-progress" || normalized === "answered") return "ACTIVE";
    if (normalized === "ringing" || normalized === "queued") return "STARTED";
    return "ACTIVE";
  }

  private toSessionStatus(callStatus: RuntimeCallStatus): RuntimeSessionStatus | null {
    if (callStatus === "ACTIVE" || callStatus === "STARTED") return "ACTIVE";
    if (callStatus === "COMPLETED") return "COMPLETED";
    if (callStatus === "FAILED") return "FAILED";
    return null;
  }
}

import type {
  CallRuntimeSession,
  RuntimeCallDirection,
  RuntimeProviderSelection
} from "../../domain/entities/runtime-orchestration.js";
import type { MongoRuntimeSessionRepository } from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { ProviderRuntimeSelectionService } from "./provider-runtime-selection-service.js";
import type { RuntimeIncidentService } from "./runtime-incident-service.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";
import type { TwilioIntegrationService } from "./twilio-integration-service.js";

export interface CreateRuntimeSessionInput {
  organizationId: string;
  conversationId: string;
  direction: RuntimeCallDirection;
  callSid?: string;
  metadata?: Record<string, unknown>;
}

export class AICallOrchestratorService {
  public constructor(
    private readonly sessions: MongoRuntimeSessionRepository,
    private readonly providerSelection: ProviderRuntimeSelectionService,
    private readonly twilio: TwilioIntegrationService,
    private readonly incidents: RuntimeIncidentService,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async createRuntimeSession(input: CreateRuntimeSessionInput): Promise<{
    session: CallRuntimeSession;
    providerSelection: RuntimeProviderSelection;
  }> {
    const selection = await this.providerSelection.select(input.organizationId);
    const session = await this.sessions.create({
      organizationId: input.organizationId,
      conversationId: input.conversationId,
      ...(input.callSid ? { callSid: input.callSid } : {}),
      direction: input.direction,
      status: "INITIALIZING",
      provider: selection.provider,
      model: selection.model,
      metadata: {
        memoryInitialized: true,
        crmInitialized: true,
        knowledgeRetrievalInitialized: true,
        analyticsTrackingInitialized: true,
        supervisorMonitoringInitialized: true,
        ...(input.metadata ?? {})
      }
    });

    await this.sessions.updateStatus(input.organizationId, session.id, "ACTIVE");
    await this.realtime.publish(input.organizationId, "runtime.session.created", { session, providerSelection: selection });
    return { session: { ...session, status: "ACTIVE" }, providerSelection: selection };
  }

  public async startOutboundCall(input: {
    organizationId: string;
    conversationId: string;
    to: string;
    from?: string;
    webhookUrl?: string;
  }): Promise<CallRuntimeSession> {
    const call = this.twilio.initiateOutgoingCall({
      to: input.to,
      ...(input.from ? { from: input.from } : {}),
      ...(input.webhookUrl ? { webhookUrl: input.webhookUrl } : {})
    });
    const { session } = await this.createRuntimeSession({
      organizationId: input.organizationId,
      conversationId: input.conversationId,
      direction: "OUTBOUND",
      metadata: {
        outboundCallQueued: call.queued,
        to: call.to,
        from: call.from,
        webhookUrl: call.webhookUrl
      }
    });
    await this.realtime.publish(input.organizationId, "runtime.call.outbound.queued", { session, call });
    return session;
  }

  public async failSession(organizationId: string, sessionId: string, message: string): Promise<void> {
    await this.sessions.updateStatus(organizationId, sessionId, "FAILED", { completedAt: new Date() });
    await this.incidents.create({
      organizationId,
      sessionId,
      severity: "HIGH",
      category: "UNKNOWN",
      message
    });
    await this.realtime.publish(organizationId, "runtime.session.failed", { sessionId, message });
  }
}

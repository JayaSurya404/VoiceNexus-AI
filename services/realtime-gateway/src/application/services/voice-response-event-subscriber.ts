import type { EventBus, RealtimeEventEnvelope } from "../ports/event-bus.js";
import type { AgentTakeoverService } from "./agent-takeover-service.js";
import type { VoiceResponseService } from "./voice-response-service.js";

export class VoiceResponseEventSubscriber {
  constructor(
    private readonly eventBus: EventBus,
    private readonly voiceResponses: VoiceResponseService,
    private readonly takeover?: AgentTakeoverService,
  ) {}

  async start(): Promise<void> {
    await this.eventBus.subscribe("voice.response.requested", (event) => this.handle(event));
  }

  private async handle(event: RealtimeEventEnvelope): Promise<void> {
    const payload = event.payload;
    const responseText = typeof payload.responseText === "string" ? payload.responseText : "";
    const callId = typeof payload.callId === "string" ? payload.callId : event.callSessionId;
    console.info("[voice-response-subscriber] received", {
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
      callId,
      responseLength: responseText.length,
      responsePreview: responseText.slice(0, 120),
    });

    if (!responseText || !callId) {
      console.warn("[voice-response-subscriber] skipped missing response text or call id", {
        organizationId: event.organizationId,
        callSessionId: event.callSessionId,
        hasResponseText: Boolean(responseText),
        callId,
      });
      return;
    }

    if (this.takeover && (await this.takeover.isTakeoverActive(event.organizationId, callId))) {
      console.info("[voice-response-subscriber] skipped because takeover is active", {
        organizationId: event.organizationId,
        callId,
      });
      return;
    }

    await this.voiceResponses.createAndPlay({
      organizationId: event.organizationId,
      sessionId: typeof payload.sessionId === "string" ? payload.sessionId : null,
      callId,
      leadId: typeof payload.leadId === "string" ? payload.leadId : null,
      responseText,
      voice: typeof payload.voice === "string" ? payload.voice : null,
    });
  }
}

import type { EventBus, RealtimeEventEnvelope } from "../ports/event-bus.js";
import type { VoiceResponseService } from "./voice-response-service.js";

export class VoiceResponseEventSubscriber {
  constructor(
    private readonly eventBus: EventBus,
    private readonly voiceResponses: VoiceResponseService,
  ) {}

  async start(): Promise<void> {
    await this.eventBus.subscribe("voice.response.requested", (event) => this.handle(event));
  }

  private async handle(event: RealtimeEventEnvelope): Promise<void> {
    const payload = event.payload;
    const responseText = typeof payload.responseText === "string" ? payload.responseText : "";
    const callId = typeof payload.callId === "string" ? payload.callId : event.callSessionId;

    if (!responseText || !callId) {
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

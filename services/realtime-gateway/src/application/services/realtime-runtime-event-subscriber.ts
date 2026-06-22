import type { EventBus, RealtimeEventEnvelope } from "../ports/event-bus.js";
import type { VoiceResponseRepository } from "../ports/repositories.js";
import type { BargeInService } from "./barge-in-service.js";
import type { PlaybackSessionService } from "./playback-session-service.js";
import type { RealtimeConversationService } from "./realtime-conversation-service.js";
import type { SpeechStateService } from "./speech-state-service.js";
import type { TurnManagerService } from "./turn-manager-service.js";

type PlaybackPayload = {
  type?: string;
  voiceResponseId?: string;
};

export class RealtimeRuntimeEventSubscriber {
  constructor(
    private readonly eventBus: EventBus,
    private readonly conversations: RealtimeConversationService,
    private readonly speechState: SpeechStateService,
    private readonly turns: TurnManagerService,
    private readonly bargeIns: BargeInService,
    private readonly playbackSessions: PlaybackSessionService,
    private readonly voiceResponses: VoiceResponseRepository,
  ) {}

  async start(): Promise<void> {
    await this.eventBus.subscribe("transcript.partial", (event) => this.handlePartialTranscript(event));
    await this.eventBus.subscribe("transcript.final", (event) => this.handleFinalTranscript(event));
    await this.eventBus.subscribe("voice.response.requested", (event) => this.handleVoiceResponseRequested(event));
    await this.eventBus.subscribe("voice.response.playback", (event) => this.handleVoiceResponsePlayback(event));
    await this.eventBus.subscribe("call.lifecycle", (event) => this.handleCallLifecycle(event));
  }

  private async handlePartialTranscript(event: RealtimeEventEnvelope): Promise<void> {
    if (!event.callSessionId) return;
    const text = stringPayload(event, "text");
    const conversation = await this.conversations.ensure({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
    });
    await this.turns.customerStarted(conversation, text);
    await this.bargeIns.detect(conversation, text);
  }

  private async handleFinalTranscript(event: RealtimeEventEnvelope): Promise<void> {
    if (!event.callSessionId) return;
    const text = stringPayload(event, "text") ?? stringPayload(event, "transcript") ?? "";
    const latencyMs = numberPayload(event, "latencyMs");
    const conversation = await this.conversations.ensure({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
    });
    await this.turns.customerEnded(conversation, text, latencyMs);
    if (!conversation.takeoverActive) {
      await this.speechState.change(conversation, "PROCESSING", "Final transcript forwarded to AI runtime");
    }
  }

  private async handleVoiceResponseRequested(event: RealtimeEventEnvelope): Promise<void> {
    if (!event.callSessionId) return;
    const sessionId = stringPayload(event, "sessionId");
    const conversation = await this.conversations.ensure({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
      aiSessionId: sessionId,
    });
    if (!conversation.takeoverActive) {
      await this.speechState.change(conversation, "PROCESSING", "AI response text requested voice playback");
    }
  }

  private async handleVoiceResponsePlayback(event: RealtimeEventEnvelope): Promise<void> {
    if (!event.callSessionId) return;
    const payload = event.payload as PlaybackPayload;
    const voiceResponseId = payload.voiceResponseId;
    if (!voiceResponseId) return;
    const conversation = await this.conversations.ensure({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
    });
    const voiceResponse = await this.voiceResponses.findById(voiceResponseId);

    if (payload.type === "VOICE_RESPONSE_STARTED") {
      await this.turns.aiStarted(conversation, voiceResponseId);
      await this.playbackSessions.start(conversation, voiceResponseId, voiceResponse?.durationMs ?? 0);
      await this.speechState.change(conversation, "RESPONDING", "AI playback started");
      return;
    }

    if (payload.type === "VOICE_RESPONSE_COMPLETED") {
      await this.turns.aiEnded(conversation, voiceResponseId, voiceResponse?.latencyMs ?? null);
      await this.playbackSessions.complete(conversation, voiceResponseId);
      await this.speechState.change(conversation, "LISTENING", "AI playback completed");
    }
  }

  private async handleCallLifecycle(event: RealtimeEventEnvelope): Promise<void> {
    if (!event.callSessionId) return;
    const type = stringPayload(event, "type");
    if (!type || !["CALL_COMPLETED", "CALL_ENDED", "STOP"].includes(type)) return;
    const conversation = await this.conversations.ensure({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
    });
    await this.speechState.change(conversation, "COMPLETED", "Call lifecycle ended");
  }
}

function stringPayload(event: RealtimeEventEnvelope, key: string): string | null {
  const value = event.payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function numberPayload(event: RealtimeEventEnvelope, key: string): number | null {
  const value = event.payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

import type { EventBus } from "../ports/event-bus.js";
import type { VoiceResponseRepository } from "../ports/repositories.js";
import type { AudioBufferService } from "./audio-buffer-service.js";
import type { AudioPlaybackService } from "./audio-playback-service.js";
import type { TtsStreamService } from "./tts-stream-service.js";

export interface VoiceResponseRequest {
  organizationId: string;
  sessionId: string | null;
  callId: string;
  leadId: string | null;
  responseText: string;
  voice?: string | null;
}

export class VoiceResponseService {
  constructor(
    private readonly responses: VoiceResponseRepository,
    private readonly tts: TtsStreamService,
    private readonly buffer: AudioBufferService,
    private readonly playback: AudioPlaybackService,
    private readonly eventBus: EventBus,
  ) {}

  async createAndPlay(input: VoiceResponseRequest) {
    const startedAt = Date.now();
    let response = await this.responses.create({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      callId: input.callId,
      leadId: input.leadId,
      responseText: input.responseText,
      provider: this.tts.providerName(),
      voice: input.voice ?? "default",
      audioUrl: null,
      durationMs: 0,
      audioBytes: 0,
      status: "GENERATING",
      latencyMs: null,
      playbackStartedAt: null,
      playbackCompletedAt: null,
      error: null,
    });
    await this.eventBus.publish("voice.response.created", {
      organizationId: input.organizationId,
      callSessionId: input.callId,
      payload: { type: "VOICE_RESPONSE_CREATED", voiceResponseId: response.id },
    });
    await this.eventBus.publish("call.lifecycle", {
      organizationId: input.organizationId,
      callSessionId: input.callId,
      payload: { type: "VOICE_RESPONSE_CREATED", voiceResponseId: response.id },
    });

    try {
      const result = await this.tts.synthesize({
        organizationId: input.organizationId,
        voiceResponseId: response.id,
        text: input.responseText,
        voice: input.voice ?? null,
      });
      response = (await this.responses.update(response.id, {
        provider: result.provider,
        voice: result.voice,
        audioUrl: result.audioUrl,
        durationMs: result.durationMs,
        audioBytes: result.audioBytes,
        status: "QUEUED",
        latencyMs: Date.now() - startedAt,
      })) ?? response;
      const segment = this.buffer.queue(input.callId, {
        voiceResponseId: response.id,
        callId: input.callId,
        sequence: 1,
        mimeType: result.mimeType,
        base64Audio: result.audioBase64,
        durationMs: result.durationMs,
      });
      await this.responses.update(response.id, { status: "PLAYING", playbackStartedAt: new Date() });
      await this.eventBus.publish("voice.response.playback", {
        organizationId: input.organizationId,
        callSessionId: input.callId,
        payload: { type: "VOICE_RESPONSE_STARTED", voiceResponseId: response.id },
      });
      await this.eventBus.publish("call.lifecycle", {
        organizationId: input.organizationId,
        callSessionId: input.callId,
        payload: { type: "VOICE_RESPONSE_STARTED", voiceResponseId: response.id },
      });
      const played = this.playback.play(segment);
      await this.responses.update(response.id, {
        status: played ? "COMPLETED" : "QUEUED",
        playbackCompletedAt: played ? new Date() : null,
      });
      if (played) {
        await this.eventBus.publish("voice.response.playback", {
          organizationId: input.organizationId,
          callSessionId: input.callId,
          payload: { type: "VOICE_RESPONSE_COMPLETED", voiceResponseId: response.id },
        });
        await this.eventBus.publish("call.lifecycle", {
          organizationId: input.organizationId,
          callSessionId: input.callId,
          payload: { type: "VOICE_RESPONSE_COMPLETED", voiceResponseId: response.id },
        });
      }
      return response;
    } catch (error) {
      await this.responses.update(response.id, {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Voice response failed",
        latencyMs: Date.now() - startedAt,
      });
      throw error;
    }
  }
}

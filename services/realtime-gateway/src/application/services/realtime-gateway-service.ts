import { randomUUID } from "node:crypto";

import { z } from "zod";

import type { EventBus } from "../ports/event-bus.js";
import type { AiConversationSessionRepository } from "../ports/repositories.js";
import type { ActiveCallStateService } from "./active-call-state-service.js";
import type { RealtimeTranscriptionService } from "./realtime-transcription-service.js";
import type { AudioSegment } from "../../domain/entities/audio-segment.js";
import type { MediaStreamClaims } from "../../security/media-stream-token-service.js";
import { RealtimeError } from "../../shared/errors.js";

const twilioBaseEventSchema = z.object({
  event: z.enum(["connected", "start", "media", "dtmf", "mark", "stop"]),
  sequenceNumber: z.string().optional(),
  streamSid: z.string().optional(),
});

const twilioStartSchema = twilioBaseEventSchema.extend({
  event: z.literal("start"),
  streamSid: z.string().min(1),
  start: z.object({
    accountSid: z.string().min(1).optional(),
    callSid: z.string().min(1).optional(),
    tracks: z.array(z.string()).optional(),
    mediaFormat: z
      .object({
        encoding: z.string().optional(),
        sampleRate: z.number().optional(),
        channels: z.number().optional(),
      })
      .optional(),
    customParameters: z.record(z.string()).optional(),
  }),
});

const twilioMediaSchema = twilioBaseEventSchema.extend({
  event: z.literal("media"),
  streamSid: z.string().min(1),
  media: z.object({
    track: z.string().optional(),
    chunk: z.string().optional(),
    timestamp: z.string().optional(),
    payload: z.string().min(1),
  }),
});

const twilioDtmfSchema = twilioBaseEventSchema.extend({
  event: z.literal("dtmf"),
  streamSid: z.string().min(1),
  dtmf: z.object({
    track: z.string().optional(),
    digit: z.string().min(1).max(4),
  }),
});

const twilioMarkSchema = twilioBaseEventSchema.extend({
  event: z.literal("mark"),
  streamSid: z.string().min(1),
  mark: z.object({
    name: z.string().min(1),
  }),
});

const twilioStopSchema = twilioBaseEventSchema.extend({
  event: z.literal("stop"),
  streamSid: z.string().min(1),
  stop: z.object({
    accountSid: z.string().optional(),
    callSid: z.string().optional(),
  }),
});

export interface RealtimeConnectionContext {
  aiConversationSessionId: string | null;
  connectionId: string;
  organizationId: string;
  callSessionId: string;
  providerCallSid: string | null;
}

export class RealtimeGatewayService {
  constructor(
    private readonly activeCalls: ActiveCallStateService,
    private readonly conversations: AiConversationSessionRepository,
    private readonly eventBus: EventBus,
    private readonly transcription: RealtimeTranscriptionService,
  ) {}

  async openConnection(claims: MediaStreamClaims): Promise<RealtimeConnectionContext> {
    const now = new Date().toISOString();
    const context: RealtimeConnectionContext = {
      aiConversationSessionId: null,
      connectionId: randomUUID(),
      organizationId: claims.organizationId,
      callSessionId: claims.callSessionId,
      providerCallSid: claims.providerCallSid ?? null,
    };

    const conversation = await this.ensureConversation(context, "CONNECTING", null);
    context.aiConversationSessionId = conversation?.id ?? null;
    await this.activeCalls.upsertActiveCall({
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      providerCallSid: context.providerCallSid,
      streamSid: null,
      status: "CONNECTING",
      connectedAt: now,
      updatedAt: now,
      from: null,
      to: null,
    });
    await this.activeCalls.upsertConnectionState({
      connectionId: context.connectionId,
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      streamSid: null,
      lastEvent: "socket.open",
      lastSequenceNumber: null,
      connectedAt: now,
      updatedAt: now,
    });
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "SOCKET_CONNECTED",
        connectionId: context.connectionId,
        status: "CONNECTING",
      },
    });

    return context;
  }

  async handleMessage(context: RealtimeConnectionContext, rawMessage: string): Promise<void> {
    const parsed = JSON.parse(rawMessage) as unknown;
    const base = twilioBaseEventSchema.parse(parsed);

    switch (base.event) {
      case "connected":
        await this.handleConnected(context, base);
        return;
      case "start":
        await this.handleStart(context, twilioStartSchema.parse(parsed));
        return;
      case "media":
        await this.handleMedia(context, twilioMediaSchema.parse(parsed));
        return;
      case "dtmf":
        await this.handleDtmf(context, twilioDtmfSchema.parse(parsed));
        return;
      case "mark":
        await this.handleMark(context, twilioMarkSchema.parse(parsed));
        return;
      case "stop":
        await this.handleStop(context, twilioStopSchema.parse(parsed));
        return;
    }
  }

  async closeConnection(context: RealtimeConnectionContext, reason: string): Promise<void> {
    await this.endCall(context, null, reason);
  }

  async playResponseAudio(segment: AudioSegment): Promise<void> {
    await this.eventBus.publish("voice.response.playback", {
      organizationId: "",
      callSessionId: segment.callId,
      payload: { type: "PLAY_RESPONSE_AUDIO", voiceResponseId: segment.voiceResponseId, sequence: segment.sequence },
    });
  }

  async queueAudio(segment: AudioSegment): Promise<void> {
    await this.eventBus.publish("voice.response.playback", {
      organizationId: "",
      callSessionId: segment.callId,
      payload: { type: "QUEUE_AUDIO", voiceResponseId: segment.voiceResponseId, sequence: segment.sequence },
    });
  }

  async completePlayback(callId: string, voiceResponseId: string): Promise<void> {
    await this.eventBus.publish("voice.response.playback", {
      organizationId: "",
      callSessionId: callId,
      payload: { type: "COMPLETE_PLAYBACK", voiceResponseId },
    });
  }

  private async handleConnected(context: RealtimeConnectionContext, event: z.infer<typeof twilioBaseEventSchema>) {
    await this.updateConnection(context, event.streamSid ?? null, "connected", sequenceNumber(event.sequenceNumber));
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "TWILIO_CONNECTED",
        connectionId: context.connectionId,
        sequenceNumber: sequenceNumber(event.sequenceNumber),
      },
    });
  }

  private async handleStart(context: RealtimeConnectionContext, event: z.infer<typeof twilioStartSchema>) {
    const callSid = event.start.callSid ?? context.providerCallSid;
    const customOrganizationId = event.start.customParameters?.organizationId;
    const customCallSessionId = event.start.customParameters?.callSessionId;

    if (customOrganizationId && customOrganizationId !== context.organizationId) {
      throw RealtimeError.forbidden("Twilio stream organization does not match signed session");
    }

    if (customCallSessionId && customCallSessionId !== context.callSessionId) {
      throw RealtimeError.forbidden("Twilio stream call session does not match signed session");
    }

    const now = new Date().toISOString();
    context.providerCallSid = callSid ?? context.providerCallSid;
    const conversation = await this.ensureConversation(context, "ACTIVE", event.streamSid, {
      accountSid: event.start.accountSid,
      mediaFormat: event.start.mediaFormat,
      tracks: event.start.tracks,
    });
    context.aiConversationSessionId = conversation?.id ?? context.aiConversationSessionId;
    await this.activeCalls.upsertActiveCall({
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      providerCallSid: context.providerCallSid,
      streamSid: event.streamSid,
      status: "ACTIVE",
      connectedAt: now,
      updatedAt: now,
      from: null,
      to: null,
    });
    await this.updateConnection(context, event.streamSid, "start", sequenceNumber(event.sequenceNumber));
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "STREAM_STARTED",
        streamSid: event.streamSid,
        providerCallSid: context.providerCallSid,
        status: "ACTIVE",
        mediaFormat: event.start.mediaFormat ?? null,
      },
    });
    await this.transcription.start({
      aiConversationSessionId: context.aiConversationSessionId,
      callSessionId: context.callSessionId,
      organizationId: context.organizationId,
      streamSid: event.streamSid,
    });
  }

  private async handleMedia(context: RealtimeConnectionContext, event: z.infer<typeof twilioMediaSchema>) {
    await this.updateConnection(context, event.streamSid, "media", sequenceNumber(event.sequenceNumber));
    await this.transcription.acceptTwilioAudio({
      base64Payload: event.media.payload,
      callSessionId: context.callSessionId,
    });
    await this.eventBus.publish("call.audio", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "MEDIA_RECEIVED",
        streamSid: event.streamSid,
        track: event.media.track ?? null,
        chunk: event.media.chunk ?? null,
        timestamp: event.media.timestamp ?? null,
        sequenceNumber: sequenceNumber(event.sequenceNumber),
        payloadBytes: Buffer.byteLength(event.media.payload, "base64"),
      },
    });
  }

  private async handleDtmf(context: RealtimeConnectionContext, event: z.infer<typeof twilioDtmfSchema>) {
    await this.updateConnection(context, event.streamSid, "dtmf", sequenceNumber(event.sequenceNumber));
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "DTMF_RECEIVED",
        streamSid: event.streamSid,
        digit: event.dtmf.digit,
        sequenceNumber: sequenceNumber(event.sequenceNumber),
      },
    });
  }

  private async handleMark(context: RealtimeConnectionContext, event: z.infer<typeof twilioMarkSchema>) {
    await this.updateConnection(context, event.streamSid, "mark", sequenceNumber(event.sequenceNumber));
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "MARK_RECEIVED",
        streamSid: event.streamSid,
        name: event.mark.name,
        sequenceNumber: sequenceNumber(event.sequenceNumber),
      },
    });
  }

  private async handleStop(context: RealtimeConnectionContext, event: z.infer<typeof twilioStopSchema>) {
    await this.updateConnection(context, event.streamSid, "stop", sequenceNumber(event.sequenceNumber));
    await this.endCall(context, event.streamSid, "Twilio stream stopped");
  }

  private async updateConnection(
    context: RealtimeConnectionContext,
    streamSid: string | null,
    lastEvent: string,
    lastSequenceNumber: number | null,
  ): Promise<void> {
    await this.activeCalls.upsertConnectionState({
      connectionId: context.connectionId,
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      streamSid,
      lastEvent,
      lastSequenceNumber,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async endCall(
    context: RealtimeConnectionContext,
    streamSid: string | null,
    reason: string,
  ): Promise<void> {
    await this.transcription.stop(context.callSessionId, reason);
    await this.conversations.updateByCallSession(context.organizationId, context.callSessionId, {
      status: "ENDED",
      streamSid,
      endedAt: new Date(),
    });
    await this.activeCalls.removeActiveCall(context.organizationId, context.callSessionId);
    await this.eventBus.publish("call.lifecycle", {
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      payload: {
        type: "STREAM_ENDED",
        streamSid,
        reason,
        status: "ENDED",
      },
    });
  }

  private async ensureConversation(
    context: RealtimeConnectionContext,
    status: "CONNECTING" | "ACTIVE",
    streamSid: string | null,
    metadata: Record<string, unknown> = {},
  ) {
    const existing = await this.conversations.findByCallSession(context.organizationId, context.callSessionId);

    if (existing) {
      return this.conversations.updateByCallSession(context.organizationId, context.callSessionId, {
        providerCallSid: context.providerCallSid,
        streamSid,
        status,
        startedAt: existing.startedAt ?? new Date(),
        metadata: { ...existing.metadata, ...metadata },
      });
    }

    return this.conversations.create({
      organizationId: context.organizationId,
      callSessionId: context.callSessionId,
      providerCallSid: context.providerCallSid,
      streamSid,
      status,
      startedAt: new Date(),
      endedAt: null,
      metadata,
    });
  }
}

function sequenceNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

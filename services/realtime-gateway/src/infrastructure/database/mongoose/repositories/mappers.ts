import type { AiConversationSession } from "../../../../domain/entities/ai-conversation-session.js";
import type { RealtimeTranscriptEvent } from "../../../../domain/entities/realtime-transcript-event.js";
import type { VoiceResponse } from "../../../../domain/entities/voice-response.js";
import type { RealtimeConversation } from "../../../../domain/entities/realtime-conversation.js";
import type { TurnEvent } from "../../../../domain/entities/turn-event.js";
import type { BargeInEvent } from "../../../../domain/entities/barge-in-event.js";
import type { PlaybackSession } from "../../../../domain/entities/playback-session.js";
import type { AiConversationSessionMongoDocument } from "../models/ai-conversation-session-model.js";
import type { RealtimeTranscriptEventMongoDocument } from "../models/realtime-transcript-event-model.js";
import type { RealtimeConversationMongoDocument } from "../models/realtime-conversation-model.js";
import type { TurnEventMongoDocument } from "../models/turn-event-model.js";
import type { BargeInEventMongoDocument } from "../models/barge-in-event-model.js";
import type { PlaybackSessionMongoDocument } from "../models/playback-session-model.js";

function objectIdToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toHexString" in value) {
    return (value as { toHexString: () => string }).toHexString();
  }
  return "";
}

function optionalObjectIdToString(value: unknown): string | null {
  return value ? objectIdToString(value) : null;
}

export function mapAiConversationSession(document: AiConversationSessionMongoDocument): AiConversationSession {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    providerCallSid: document.providerCallSid,
    streamSid: document.streamSid,
    status: document.status,
    startedAt: document.startedAt,
    endedAt: document.endedAt,
    metadata: document.metadata,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toVoiceResponse(doc: Record<string, unknown> & { _id: { toString(): string } }): VoiceResponse {
  return {
    id: doc._id.toString(),
    organizationId: objectIdToString(doc.organizationId),
    sessionId: optionalObjectIdToString(doc.sessionId),
    callId: objectIdToString(doc.callId),
    leadId: optionalObjectIdToString(doc.leadId),
    responseText: String(doc.responseText),
    provider: String(doc.provider),
    voice: String(doc.voice),
    audioUrl: typeof doc.audioUrl === "string" ? doc.audioUrl : null,
    durationMs: Number(doc.durationMs),
    audioBytes: Number(doc.audioBytes),
    status: doc.status as VoiceResponse["status"],
    latencyMs: doc.latencyMs === null || doc.latencyMs === undefined ? null : Number(doc.latencyMs),
    playbackStartedAt: doc.playbackStartedAt instanceof Date ? doc.playbackStartedAt : null,
    playbackCompletedAt: doc.playbackCompletedAt instanceof Date ? doc.playbackCompletedAt : null,
    error: typeof doc.error === "string" ? doc.error : null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(String(doc.createdAt)),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(String(doc.updatedAt)),
  };
}

export function mapRealtimeTranscriptEvent(document: RealtimeTranscriptEventMongoDocument): RealtimeTranscriptEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    aiConversationSessionId: document.aiConversationSessionId?.toHexString() ?? null,
    type: document.type,
    speaker: document.speaker,
    text: document.text,
    language: document.language,
    confidence: document.confidence,
    sequenceNumber: document.sequenceNumber,
    metadata: document.metadata,
    createdAt: document.createdAt,
  };
}

export function mapRealtimeConversation(document: RealtimeConversationMongoDocument): RealtimeConversation {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    aiSessionId: document.aiSessionId?.toHexString() ?? null,
    status: document.status,
    speechState: document.speechState,
    currentTurnId: document.currentTurnId?.toHexString() ?? null,
    activePlaybackSessionId: document.activePlaybackSessionId?.toHexString() ?? null,
    takeoverActive: document.takeoverActive,
    takeoverBy: document.takeoverBy?.toHexString() ?? null,
    startedAt: document.startedAt,
    endedAt: document.endedAt,
    metadata: document.metadata,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapTurnEvent(document: TurnEventMongoDocument): TurnEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    realtimeConversationId: document.realtimeConversationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    type: document.type,
    speaker: document.speaker,
    transcript: document.transcript,
    latencyMs: document.latencyMs,
    metadata: document.metadata,
    occurredAt: document.occurredAt,
    createdAt: document.createdAt,
  };
}

export function mapBargeInEvent(document: BargeInEventMongoDocument): BargeInEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    realtimeConversationId: document.realtimeConversationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    playbackSessionId: document.playbackSessionId?.toHexString() ?? null,
    voiceResponseId: document.voiceResponseId?.toHexString() ?? null,
    transcriptFragment: document.transcriptFragment,
    reason: document.reason,
    detectedAt: document.detectedAt,
    createdAt: document.createdAt,
  };
}

export function mapPlaybackSession(document: PlaybackSessionMongoDocument): PlaybackSession {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    realtimeConversationId: document.realtimeConversationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    voiceResponseId: document.voiceResponseId.toHexString(),
    status: document.status,
    progressMs: document.progressMs,
    durationMs: document.durationMs,
    queuedAt: document.queuedAt,
    startedAt: document.startedAt,
    completedAt: document.completedAt,
    cancelledAt: document.cancelledAt,
    metadata: document.metadata,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

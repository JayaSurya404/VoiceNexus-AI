import type { AiConversationSession } from "../../../../domain/entities/ai-conversation-session.js";
import type { RealtimeTranscriptEvent } from "../../../../domain/entities/realtime-transcript-event.js";
import type { VoiceResponse } from "../../../../domain/entities/voice-response.js";
import type { AiConversationSessionMongoDocument } from "../models/ai-conversation-session-model.js";
import type { RealtimeTranscriptEventMongoDocument } from "../models/realtime-transcript-event-model.js";

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

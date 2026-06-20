import type { AiConversationSession } from "../../../../domain/entities/ai-conversation-session.js";
import type { RealtimeTranscriptEvent } from "../../../../domain/entities/realtime-transcript-event.js";
import type { AiConversationSessionMongoDocument } from "../models/ai-conversation-session-model.js";
import type { RealtimeTranscriptEventMongoDocument } from "../models/realtime-transcript-event-model.js";

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

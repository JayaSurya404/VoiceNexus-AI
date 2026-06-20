import type { EventBus } from "../ports/event-bus.js";
import type { RealtimeTranscriptEventRepository } from "../ports/repositories.js";
import type { RealtimeTranscriptEventType } from "../../domain/entities/realtime-transcript-event.js";
import type { TranscriptBufferService } from "./transcript-buffer-service.js";

export interface RealtimeTranscriptInput {
  aiConversationSessionId: string | null;
  callSessionId: string;
  confidence: number | null;
  language: string | null;
  metadata: Record<string, unknown>;
  organizationId: string;
  sequenceNumber: number;
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  type: RealtimeTranscriptEventType;
}

export class TranscriptPersistenceService {
  constructor(
    private readonly transcriptBuffer: TranscriptBufferService,
    private readonly transcripts: RealtimeTranscriptEventRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handleTranscript(input: RealtimeTranscriptInput): Promise<void> {
    const text = input.text.trim();

    if (!text) {
      return;
    }

    const event = await this.transcripts.create({
      aiConversationSessionId: input.aiConversationSessionId,
      callSessionId: input.callSessionId,
      confidence: input.confidence,
      language: input.language,
      metadata: input.metadata,
      organizationId: input.organizationId,
      sequenceNumber: input.sequenceNumber,
      speaker: input.speaker,
      text,
      type: input.type,
    });
    const createdAt = event.createdAt.toISOString();

    await this.transcriptBuffer.append({
      callSessionId: input.callSessionId,
      createdAt,
      organizationId: input.organizationId,
      sequenceNumber: input.sequenceNumber,
      speaker: input.speaker,
      text,
      type: input.type,
    });
    await this.eventBus.publish(input.type === "FINAL" ? "transcript.final" : "transcript.partial", {
      callSessionId: input.callSessionId,
      organizationId: input.organizationId,
      payload: {
        aiConversationSessionId: input.aiConversationSessionId,
        confidence: input.confidence,
        createdAt,
        id: event.id,
        language: input.language,
        metadata: input.metadata,
        sequenceNumber: input.sequenceNumber,
        speaker: input.speaker,
        text,
        type: input.type,
      },
    });
  }
}

import type { RedisClientType } from "redis";

import type { RealtimeEventEnvelope } from "../ports/event-bus.js";
import type { RealtimeTranscriptEventRepository } from "../ports/repositories.js";
import type { BufferedTranscriptEvent } from "../../domain/realtime-state.js";

const BUFFER_LIMIT = 100;
const BUFFER_TTL_SECONDS = 60 * 60 * 6;

export class TranscriptBufferService {
  constructor(
    private readonly redis: RedisClientType,
    private readonly transcripts: RealtimeTranscriptEventRepository,
  ) {}

  async append(input: BufferedTranscriptEvent): Promise<void> {
    const key = bufferKey(input.callSessionId);
    await this.redis.rPush(key, JSON.stringify(input));
    await this.redis.lTrim(key, -BUFFER_LIMIT, -1);
    await this.redis.expire(key, BUFFER_TTL_SECONDS);
  }

  async appendFromEvent(event: RealtimeEventEnvelope): Promise<void> {
    const payload = event.payload;
    const text = typeof payload.text === "string" ? payload.text : "";
    const speaker = payload.speaker === "ASSISTANT" || payload.speaker === "SYSTEM" ? payload.speaker : "CUSTOMER";
    const sequenceNumber = typeof payload.sequenceNumber === "number" ? payload.sequenceNumber : 0;

    if (!event.callSessionId || !text) {
      return;
    }

    await this.append({
      organizationId: event.organizationId,
      callSessionId: event.callSessionId,
      type: event.topic === "transcript.final" ? "FINAL" : "PARTIAL",
      speaker,
      text,
      sequenceNumber,
      createdAt: event.occurredAt,
    });
  }

  async list(callSessionId: string): Promise<BufferedTranscriptEvent[]> {
    const values = await this.redis.lRange(bufferKey(callSessionId), 0, -1);
    return values.map((value) => JSON.parse(value) as BufferedTranscriptEvent);
  }

  async persistFinalEvent(input: {
    organizationId: string;
    callSessionId: string;
    aiConversationSessionId: string | null;
    text: string;
    speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
    sequenceNumber: number;
  }): Promise<void> {
    await this.transcripts.create({
      organizationId: input.organizationId,
      callSessionId: input.callSessionId,
      aiConversationSessionId: input.aiConversationSessionId,
      type: "FINAL",
      speaker: input.speaker,
      text: input.text,
      language: null,
      confidence: null,
      sequenceNumber: input.sequenceNumber,
      metadata: { source: "realtime-gateway" },
    });
  }
}

function bufferKey(callSessionId: string): string {
  return `realtime_transcript_buffer:${callSessionId}`;
}

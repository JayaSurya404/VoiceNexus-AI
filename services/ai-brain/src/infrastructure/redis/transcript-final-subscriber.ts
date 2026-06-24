import type { AgentRuntimeService, FinalTranscriptEvent } from "../../application/services/agent-runtime-service.js";
import { getRedisSubscriber } from "./redis-client.js";

export class TranscriptFinalSubscriber {
  constructor(private readonly runtime: AgentRuntimeService) {}

  async start(): Promise<void> {
    const subscriber = await getRedisSubscriber();
    await subscriber.subscribe("transcript.final", (message) => {
      void this.handleMessage(message);
    });
    console.log("[ai-brain] Subscribed to transcript.final");
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const event = normalizeTranscriptEvent(JSON.parse(message) as Record<string, unknown>);
      console.info("[ai-brain] transcript.final received", {
        organizationId: event.organizationId,
        callSessionId: event.callSessionId,
        sequenceNumber: event.sequenceNumber,
        textLength: event.text.length,
        textPreview: event.text.slice(0, 120),
      });

      if (event.text.trim()) {
        await this.runtime.processTranscript(event);
      }
    } catch (error) {
      console.error("[ai-brain] Failed to process transcript.final", error);
    }
  }
}

function normalizeTranscriptEvent(raw: Record<string, unknown>): FinalTranscriptEvent {
  const payload = isRecord(raw.payload) ? raw.payload : raw;
  return {
    organizationId: stringValue(payload.organizationId ?? raw.organizationId),
    callSessionId: stringValue(payload.callSessionId ?? raw.callSessionId),
    text: stringValue(payload.text),
    sequenceNumber: numberValue(payload.sequenceNumber),
    createdAt: stringValue(payload.createdAt ?? raw.occurredAt ?? new Date().toISOString()),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

import type { VoiceResponseRequestService } from "../../application/services/voice-response-request-service.js";
import { getRedisSubscriber } from "./redis-client.js";

export class CallStreamStartedSubscriber {
  private readonly greetedSessions = new Set<string>();

  constructor(private readonly voiceResponses: VoiceResponseRequestService) {}

  async start(): Promise<void> {
    const subscriber = await getRedisSubscriber();
    await subscriber.subscribe("call.lifecycle", (message) => {
      void this.handleMessage(message);
    });
    console.log("[ai-brain] Subscribed to call.lifecycle for stream greetings");
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const event = JSON.parse(message) as {
        organizationId?: string;
        callSessionId?: string;
        payload?: Record<string, unknown>;
      };
      const payload = event.payload ?? {};
      if (payload.type !== "STREAM_STARTED") {
        return;
      }

      const organizationId = event.organizationId;
      const callSessionId = event.callSessionId;
      if (!organizationId || !callSessionId || this.greetedSessions.has(callSessionId)) {
        return;
      }

      this.greetedSessions.add(callSessionId);
      const greeting = "Hello, this is VoiceNexus AI. How can I help you today?";
      await this.voiceResponses.request({
        organizationId,
        callId: callSessionId,
        sessionId: null,
        leadId: null,
        responseText: greeting,
      });
      console.info("[ai-brain] initial greeting requested", {
        organizationId,
        callSessionId,
      });
    } catch (error) {
      console.error("[ai-brain] Failed to process call.lifecycle greeting", error);
    }
  }
}

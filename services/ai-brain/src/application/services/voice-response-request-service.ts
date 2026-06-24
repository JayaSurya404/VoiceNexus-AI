import { randomUUID } from "node:crypto";

import { getRedisPublisher } from "../../infrastructure/redis/redis-client.js";

export class VoiceResponseRequestService {
  async request(input: {
    organizationId: string;
    callId: string;
    sessionId: string | null;
    leadId: string | null;
    responseText: string;
  }): Promise<void> {
    const publisher = await getRedisPublisher();
    console.info("[voice-response-request] publishing", {
      organizationId: input.organizationId,
      callSessionId: input.callId,
      sessionId: input.sessionId,
      leadId: input.leadId,
      responseLength: input.responseText.length,
      responsePreview: input.responseText.slice(0, 120),
    });
    await publisher.publish(
      "voice.response.requested",
      JSON.stringify({
        id: randomUUID(),
        topic: "voice.response.requested",
        organizationId: input.organizationId,
        callSessionId: input.callId,
        occurredAt: new Date().toISOString(),
        payload: input,
      }),
    );
  }
}

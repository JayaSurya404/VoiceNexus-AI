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

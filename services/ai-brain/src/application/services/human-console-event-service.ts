import { randomUUID } from "node:crypto";

import { getRedisPublisher } from "../../infrastructure/redis/redis-client.js";

export type HumanConsoleTopic =
  | "agent.joined"
  | "agent.left"
  | "queue.created"
  | "queue.updated"
  | "queue.session.created"
  | "queue.session.assigned"
  | "routing.completed"
  | "routing.failed"
  | "escalation.started"
  | "takeover.started"
  | "takeover.ended"
  | "whisper.created"
  | "supervisor.joined"
  | "supervisor.left";

export class HumanConsoleEventService {
  async publish(
    topic: HumanConsoleTopic,
    input: {
      organizationId: string;
      sessionId?: string | null;
      payload: Record<string, unknown>;
    },
  ): Promise<void> {
    const publisher = await getRedisPublisher();
    await publisher.publish(
      topic,
      JSON.stringify({
        id: randomUUID(),
        topic,
        organizationId: input.organizationId,
        callSessionId: input.sessionId ?? null,
        occurredAt: new Date().toISOString(),
        payload: input.payload,
      }),
    );
  }
}

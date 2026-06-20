import { randomUUID } from "node:crypto";

import type {
  EventBus,
  RealtimeEventEnvelope,
  RealtimeEventHandler,
  RealtimeTopic,
} from "../../application/ports/event-bus.js";
import { realtimeTopics } from "../../application/ports/event-bus.js";
import { getRedisPublisherClient, getRedisSubscriberClient } from "./redis-client.js";

export class RedisEventBus implements EventBus {
  private readonly handlers = new Map<RealtimeTopic, Set<RealtimeEventHandler>>();

  async connect(): Promise<void> {
    await Promise.all([this.publisher().isOpen ? undefined : this.publisher().connect()]);
  }

  disconnect(): Promise<void> {
    this.handlers.clear();
    return Promise.resolve();
  }

  async publish<TPayload extends Record<string, unknown>>(
    topic: RealtimeTopic,
    event: Omit<RealtimeEventEnvelope<TPayload>, "id" | "topic" | "occurredAt">,
  ): Promise<void> {
    const envelope: RealtimeEventEnvelope<TPayload> = {
      id: randomUUID(),
      topic,
      occurredAt: new Date().toISOString(),
      ...event,
    };

    await this.publisher().publish(topic, JSON.stringify(envelope));
  }

  async subscribe(topic: RealtimeTopic, handler: RealtimeEventHandler): Promise<void> {
    const topicHandlers = this.handlers.get(topic) ?? new Set<RealtimeEventHandler>();
    topicHandlers.add(handler);
    this.handlers.set(topic, topicHandlers);

    if (topicHandlers.size === 1) {
      await this.subscriber().subscribe(topic, (message) => {
        void this.dispatch(topic, message);
      });
    }
  }

  async subscribeToAll(handler: RealtimeEventHandler): Promise<void> {
    await Promise.all(realtimeTopics.map((topic) => this.subscribe(topic, handler)));
  }

  private async dispatch(topic: RealtimeTopic, message: string): Promise<void> {
    const handlers = this.handlers.get(topic);

    if (!handlers?.size) {
      return;
    }

    const event = JSON.parse(message) as RealtimeEventEnvelope;
    await Promise.all([...handlers].map(async (handler) => handler(event)));
  }

  private publisher() {
    return getRedisPublisherClient();
  }

  private subscriber() {
    return getRedisSubscriberClient();
  }
}

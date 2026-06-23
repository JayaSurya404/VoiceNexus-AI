import type { RedisConnectionManager } from "../../infrastructure/redis/redis-connection-manager.js";

export interface RuntimeRealtimeEvent {
  organizationId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export class RuntimeRealtimeEventService {
  public constructor(private readonly redis: RedisConnectionManager) {}

  public async publish(organizationId: string, type: string, payload: Record<string, unknown>): Promise<void> {
    await this.redis.enqueue("runtime-events", {
      organizationId,
      type,
      payload,
      createdAt: new Date().toISOString()
    });
  }
}

import { createClient, type RedisClientType } from "redis";

import { env } from "../../config/env.js";

let subscriber: RedisClientType | null = null;

export async function getRedisSubscriber(): Promise<RedisClientType> {
  if (!subscriber) {
    subscriber = createClient({ url: env.REDIS_URL });
    subscriber.on("error", (error) => console.error("[ai-brain] Redis subscriber error", error));
    await subscriber.connect();
    console.log("[ai-brain] Redis subscriber connected");
  }

  return subscriber;
}

export async function closeRedis(): Promise<void> {
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
}

import { createClient, type RedisClientType } from "redis";

import { env } from "../../config/env.js";

let subscriber: RedisClientType | null = null;
let publisher: RedisClientType | null = null;

export async function getRedisSubscriber(): Promise<RedisClientType> {
  if (!subscriber) {
    subscriber = createClient({ url: env.REDIS_URL });
    subscriber.on("error", (error) => console.error("[ai-brain] Redis subscriber error", error));
    await subscriber.connect();
    console.log("[ai-brain] Redis subscriber connected");
  }

  return subscriber;
}

export async function getRedisPublisher(): Promise<RedisClientType> {
  if (!publisher) {
    publisher = createClient({ url: env.REDIS_URL });
    publisher.on("error", (error) => console.error("[ai-brain] Redis publisher error", error));
    await publisher.connect();
  }

  return publisher;
}

export async function closeRedis(): Promise<void> {
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
  if (publisher) {
    await publisher.quit();
    publisher = null;
  }
}

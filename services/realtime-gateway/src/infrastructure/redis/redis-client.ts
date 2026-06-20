import { createClient, type RedisClientType } from "redis";

import { env } from "../../config/env.js";

let commandClient: RedisClientType | null = null;
let publisherClient: RedisClientType | null = null;
let subscriberClient: RedisClientType | null = null;

export function getRedisCommandClient(): RedisClientType {
  commandClient ??= createClient({ url: env.REDIS_URL });
  return commandClient;
}

export function getRedisPublisherClient(): RedisClientType {
  publisherClient ??= createClient({ url: env.REDIS_URL });
  return publisherClient;
}

export function getRedisSubscriberClient(): RedisClientType {
  subscriberClient ??= createClient({ url: env.REDIS_URL });
  return subscriberClient;
}

export async function connectRedis(): Promise<void> {
  const clients = [getRedisCommandClient(), getRedisPublisherClient(), getRedisSubscriberClient()];
  await Promise.all(clients.map(async (client) => (client.isOpen ? undefined : client.connect())));
}

export async function disconnectRedis(): Promise<void> {
  const clients = [commandClient, publisherClient, subscriberClient].filter((client) => client?.isOpen);
  await Promise.all(clients.map(async (client) => client?.quit()));
  commandClient = null;
  publisherClient = null;
  subscriberClient = null;
}

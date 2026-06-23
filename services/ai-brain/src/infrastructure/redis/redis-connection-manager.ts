export interface RedisClientLike {
  del(key: string): Promise<number>;
  get(key: string): Promise<string | null>;
  lpop(key: string): Promise<string | null>;
  ping(): Promise<string>;
  rpush(key: string, value: string): Promise<number>;
  set(key: string, value: string, mode?: "PX", ttlMs?: number, condition?: "NX"): Promise<"OK" | null>;
}

export class RedisConnectionManager {
  constructor(
    private readonly options: {
      url: string | null;
      keyPrefix: string;
      client?: RedisClientLike | null;
    },
  ) {}

  get configured(): boolean {
    return Boolean(this.options.url || this.options.client);
  }

  key(key: string): string {
    return `${this.options.keyPrefix}:${key}`;
  }

  async health(): Promise<{ ready: boolean; message: string }> {
    if (!this.options.client) {
      return {
        ready: Boolean(this.options.url),
        message: this.options.url ? "Redis URL configured; runtime client not attached" : "REDIS_URL is missing",
      };
    }

    const pong = await this.options.client.ping();
    return { ready: pong.toUpperCase() === "PONG", message: `Redis responded ${pong}` };
  }

  async cacheSet(key: string, value: unknown, ttlMs?: number): Promise<boolean> {
    if (!this.options.client) return false;
    const result = ttlMs
      ? await this.options.client.set(this.key(`cache:${key}`), JSON.stringify(value), "PX", ttlMs)
      : await this.options.client.set(this.key(`cache:${key}`), JSON.stringify(value));
    return result === "OK";
  }

  async cacheGet<T>(key: string): Promise<T | null> {
    if (!this.options.client) return null;
    const value = await this.options.client.get(this.key(`cache:${key}`));
    return value ? (JSON.parse(value) as T) : null;
  }

  async enqueue(queue: string, payload: unknown): Promise<boolean> {
    if (!this.options.client) return false;
    await this.options.client.rpush(this.key(`queue:${queue}`), JSON.stringify(payload));
    return true;
  }

  async dequeue<T>(queue: string): Promise<T | null> {
    if (!this.options.client) return null;
    const value = await this.options.client.lpop(this.key(`queue:${queue}`));
    return value ? (JSON.parse(value) as T) : null;
  }

  async acquireLock(key: string, ownerId: string, ttlMs: number): Promise<boolean> {
    if (!this.options.client) return false;
    return (await this.options.client.set(this.key(`lock:${key}`), ownerId, "PX", ttlMs, "NX")) === "OK";
  }

  async releaseLock(key: string): Promise<boolean> {
    if (!this.options.client) return false;
    return (await this.options.client.del(this.key(`lock:${key}`))) > 0;
  }
}

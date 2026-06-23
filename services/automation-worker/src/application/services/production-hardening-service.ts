export type WorkerHealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";

export interface RedisLockClient {
  del(key: string): Promise<number>;
  ping?(): Promise<string>;
  set(key: string, value: string, mode: "PX", ttlMs: number, condition: "NX"): Promise<"OK" | null>;
}

export interface WorkerMetric {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  recordedAt: Date;
}

export interface WorkerObservabilityEvent {
  source: "AUTOMATION_WORKER";
  eventName: string;
  severity: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

export interface WorkerErrorEvent {
  service: "automation-worker";
  fingerprint: string;
  message: string;
  stack: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

export interface RetryTrackingEvent {
  jobName: string;
  attempt: number;
  maxAttempts: number;
  status: "RETRYING" | "FAILED" | "SUCCEEDED";
  errorMessage: string | null;
  occurredAt: Date;
}

const fingerprint = (service: string, message: string) =>
  `${service}:${message}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 96);

export class AutomationWorkerProductionHardeningService {
  private readonly startedAt = new Date();
  private readonly metrics: WorkerMetric[] = [];
  private readonly events: WorkerObservabilityEvent[] = [];
  private readonly errors: WorkerErrorEvent[] = [];
  private readonly retries: RetryTrackingEvent[] = [];

  constructor(private readonly redis: RedisLockClient | null = null) {}

  liveness() {
    return {
      status: "ALIVE" as const,
      service: "automation-worker",
      uptimeSeconds: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      checkedAt: new Date(),
    };
  }

  async health() {
    const redis = await this.redisHealth();
    return {
      status: redis.status === "UNHEALTHY" ? "DEGRADED" : "HEALTHY",
      checks: [
        {
          service: "automation-worker",
          status: "HEALTHY" as const,
          latencyMs: 0,
          details: { startupComplete: true },
          checkedAt: new Date(),
        },
        redis,
      ],
      checkedAt: new Date(),
    };
  }

  async readiness() {
    const health = await this.health();
    return {
      status: health.status === "UNHEALTHY" ? "NOT_READY" : "READY",
      checks: health.checks,
      checkedAt: health.checkedAt,
    };
  }

  recordMetric(name: string, value: number, unit = "count", tags: Record<string, string> = {}): WorkerMetric {
    const metric = { name, value, unit, tags, recordedAt: new Date() };
    this.metrics.unshift(metric);
    this.metrics.splice(200);
    return metric;
  }

  recordEvent(input: Omit<WorkerObservabilityEvent, "source" | "occurredAt">): WorkerObservabilityEvent {
    const event = { ...input, source: "AUTOMATION_WORKER" as const, occurredAt: new Date() };
    this.events.unshift(event);
    this.events.splice(200);
    return event;
  }

  recordError(error: unknown, metadata: Record<string, unknown> = {}): WorkerErrorEvent {
    const message = error instanceof Error ? error.message : String(error);
    const event = {
      service: "automation-worker" as const,
      fingerprint: fingerprint("automation-worker", message),
      message,
      stack: error instanceof Error ? error.stack ?? null : null,
      severity: "HIGH" as const,
      metadata,
      occurredAt: new Date(),
    };
    this.errors.unshift(event);
    this.errors.splice(200);
    return event;
  }

  async withRetry<T>(
    jobName: string,
    operation: () => Promise<T>,
    options: { maxAttempts?: number; backoffMs?: number } = {},
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;
    const backoffMs = options.backoffMs ?? 500;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await operation();
        this.retries.unshift({ jobName, attempt, maxAttempts, status: "SUCCEEDED", errorMessage: null, occurredAt: new Date() });
        return result;
      } catch (error) {
        lastError = error;
        this.recordError(error, { jobName, attempt });
        this.retries.unshift({
          jobName,
          attempt,
          maxAttempts,
          status: attempt === maxAttempts ? "FAILED" : "RETRYING",
          errorMessage: error instanceof Error ? error.message : String(error),
          occurredAt: new Date(),
        });
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  async acquireLock(lockKey: string, ownerId: string, ttlMs: number): Promise<boolean> {
    if (!this.redis) {
      return false;
    }
    return (await this.redis.set(`lock:${lockKey}`, ownerId, "PX", ttlMs, "NX")) === "OK";
  }

  async releaseLock(lockKey: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }
    return (await this.redis.del(`lock:${lockKey}`)) > 0;
  }

  snapshots() {
    return {
      metrics: this.metrics.slice(0, 100),
      events: this.events.slice(0, 100),
      errors: this.errors.slice(0, 100),
      retries: this.retries.slice(0, 100),
    };
  }

  private async redisHealth() {
    const start = Date.now();
    try {
      const pong = this.redis?.ping ? await this.redis.ping() : "not-configured";
      return {
        service: "redis",
        status: this.redis ? "HEALTHY" as const : "DEGRADED" as const,
        latencyMs: Date.now() - start,
        details: { pong },
        checkedAt: new Date(),
      };
    } catch (error) {
      this.recordError(error, { check: "redis" });
      return {
        service: "redis",
        status: "UNHEALTHY" as const,
        latencyMs: Date.now() - start,
        details: { error: error instanceof Error ? error.message : String(error) },
        checkedAt: new Date(),
      };
    }
  }
}

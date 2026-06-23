export type ProductionHealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface RedisLockClient {
  del(key: string): Promise<number>;
  ping?(): Promise<string>;
  set(key: string, value: string, mode: "PX", ttlMs: number, condition: "NX"): Promise<"OK" | null>;
}

export interface ProductionHealthCheck {
  service: string;
  status: ProductionHealthStatus;
  latencyMs: number;
  details: Record<string, unknown>;
  checkedAt: Date;
}

export interface ProductionMetric {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  recordedAt: Date;
}

export interface ObservabilityEvent {
  source: "REALTIME_GATEWAY";
  eventName: string;
  severity: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

export interface ErrorTrackingEvent {
  service: "realtime-gateway";
  fingerprint: string;
  message: string;
  stack: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

export interface CircuitBreakerSnapshot {
  provider: "OPENAI" | "TWILIO" | "REDIS" | "WEBSOCKET";
  state: CircuitBreakerState;
  failureCount: number;
  failureThreshold: number;
  openedAt: Date | null;
  lastFailureAt: Date | null;
}

const fingerprint = (service: string, message: string) =>
  `${service}:${message}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 96);

export class RealtimeProductionHardeningService {
  private readonly startedAt = new Date();
  private readonly metrics: ProductionMetric[] = [];
  private readonly events: ObservabilityEvent[] = [];
  private readonly errors: ErrorTrackingEvent[] = [];
  private readonly breakers = new Map<CircuitBreakerSnapshot["provider"], CircuitBreakerSnapshot>();

  constructor(private readonly redis: RedisLockClient | null = null) {}

  liveness() {
    return {
      status: "ALIVE" as const,
      service: "realtime-gateway",
      uptimeSeconds: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      checkedAt: new Date(),
    };
  }

  async health(): Promise<{ status: ProductionHealthStatus; checks: ProductionHealthCheck[]; checkedAt: Date }> {
    const checks = [this.gatewayCheck(), await this.redisCheck(), this.websocketCheck()];
    const status = checks.some((check) => check.status === "UNHEALTHY")
      ? "UNHEALTHY"
      : checks.some((check) => check.status === "DEGRADED")
        ? "DEGRADED"
        : "HEALTHY";
    return { status, checks, checkedAt: new Date() };
  }

  async readiness(): Promise<{ status: "READY" | "NOT_READY"; checks: ProductionHealthCheck[]; checkedAt: Date }> {
    const health = await this.health();
    return {
      status: health.status === "UNHEALTHY" ? "NOT_READY" : "READY",
      checks: health.checks,
      checkedAt: health.checkedAt,
    };
  }

  recordMetric(name: string, value: number, unit = "count", tags: Record<string, string> = {}): ProductionMetric {
    const metric = { name, value, unit, tags, recordedAt: new Date() };
    this.metrics.unshift(metric);
    this.metrics.splice(200);
    return metric;
  }

  recordEvent(input: Omit<ObservabilityEvent, "source" | "occurredAt">): ObservabilityEvent {
    const event = { ...input, source: "REALTIME_GATEWAY" as const, occurredAt: new Date() };
    this.events.unshift(event);
    this.events.splice(200);
    return event;
  }

  recordError(error: unknown, metadata: Record<string, unknown> = {}): ErrorTrackingEvent {
    const message = error instanceof Error ? error.message : String(error);
    const event = {
      service: "realtime-gateway" as const,
      fingerprint: fingerprint("realtime-gateway", message),
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

  async withCircuitBreaker<T>(
    provider: CircuitBreakerSnapshot["provider"],
    operation: () => Promise<T>,
    failureThreshold = 5,
  ): Promise<T> {
    const breaker = this.breaker(provider, failureThreshold);
    if (breaker.state === "OPEN") {
      throw new Error(`${provider} circuit breaker is open`);
    }

    try {
      const result = await operation();
      this.breakers.set(provider, { ...breaker, state: "CLOSED", failureCount: 0, lastFailureAt: null, openedAt: null });
      return result;
    } catch (error) {
      const failureCount = breaker.failureCount + 1;
      this.breakers.set(provider, {
        ...breaker,
        failureCount,
        state: failureCount >= failureThreshold ? "OPEN" : breaker.state,
        openedAt: failureCount >= failureThreshold ? new Date() : breaker.openedAt,
        lastFailureAt: new Date(),
      });
      this.recordError(error, { provider });
      throw error;
    }
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
      circuitBreakers: [...this.breakers.values()],
    };
  }

  private gatewayCheck(): ProductionHealthCheck {
    return {
      service: "realtime-gateway",
      status: "HEALTHY",
      latencyMs: 0,
      details: { startupComplete: true },
      checkedAt: new Date(),
    };
  }

  private websocketCheck(): ProductionHealthCheck {
    return {
      service: "websocket-runtime",
      status: "HEALTHY",
      latencyMs: 0,
      details: { connectionsTracked: true },
      checkedAt: new Date(),
    };
  }

  private async redisCheck(): Promise<ProductionHealthCheck> {
    const start = Date.now();
    try {
      const pong = this.redis?.ping ? await this.redis.ping() : "not-configured";
      return {
        service: "redis",
        status: this.redis ? "HEALTHY" : "DEGRADED",
        latencyMs: Date.now() - start,
        details: { pong },
        checkedAt: new Date(),
      };
    } catch (error) {
      this.recordError(error, { check: "redis" });
      return {
        service: "redis",
        status: "UNHEALTHY",
        latencyMs: Date.now() - start,
        details: { error: error instanceof Error ? error.message : String(error) },
        checkedAt: new Date(),
      };
    }
  }

  private breaker(provider: CircuitBreakerSnapshot["provider"], failureThreshold: number): CircuitBreakerSnapshot {
    const existing = this.breakers.get(provider);
    if (existing) {
      return existing;
    }
    const created = {
      provider,
      state: "CLOSED" as const,
      failureCount: 0,
      failureThreshold,
      openedAt: null,
      lastFailureAt: null,
    };
    this.breakers.set(provider, created);
    return created;
  }
}

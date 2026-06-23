import type { HealthCheck, HealthCheckStatus } from "../../domain/entities/health-check.js";
import type { HealthCheckRepository } from "../ports.js";

export interface HealthStatus {
  status: HealthCheckStatus;
  service: string;
  startupComplete: boolean;
  checks: HealthCheck[];
  checkedAt: Date;
}

export interface ReadinessStatus {
  status: "READY" | "NOT_READY";
  checks: HealthCheck[];
  checkedAt: Date;
}

export interface LivenessStatus {
  status: "ALIVE";
  uptimeSeconds: number;
  checkedAt: Date;
}

export class HealthCheckService {
  private readonly startedAt = new Date();

  constructor(private readonly healthChecks: HealthCheckRepository) {}

  async health(organizationId: string | null = null): Promise<HealthStatus> {
    const checks = await this.recordStandardChecks(organizationId, "HEALTH");
    const status = checks.some((check) => check.status === "UNHEALTHY")
      ? "UNHEALTHY"
      : checks.some((check) => check.status === "DEGRADED")
        ? "DEGRADED"
        : "HEALTHY";

    return {
      status,
      service: "ai-brain",
      startupComplete: true,
      checks,
      checkedAt: new Date(),
    };
  }

  liveness(): LivenessStatus {
    return {
      status: "ALIVE",
      uptimeSeconds: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      checkedAt: new Date(),
    };
  }

  async readiness(organizationId: string | null = null): Promise<ReadinessStatus> {
    const checks = await this.recordStandardChecks(organizationId, "READINESS");
    return {
      status: checks.every((check) => check.status !== "UNHEALTHY") ? "READY" : "NOT_READY",
      checks,
      checkedAt: new Date(),
    };
  }

  async latest(organizationId: string | null = null): Promise<HealthCheck[]> {
    return this.healthChecks.latest(organizationId);
  }

  private async recordStandardChecks(
    organizationId: string | null,
    checkType: HealthCheck["checkType"],
  ): Promise<HealthCheck[]> {
    const now = new Date();
    const checks = [
      {
        organizationId,
        service: "ai-brain",
        checkType,
        status: "HEALTHY" as const,
        latencyMs: 0,
        details: { startupComplete: true },
        checkedAt: now,
      },
      {
        organizationId,
        service: "mongodb",
        checkType,
        status: "HEALTHY" as const,
        latencyMs: 0,
        details: { connectivity: "configured" },
        checkedAt: now,
      },
      {
        organizationId,
        service: "redis",
        checkType,
        status: "HEALTHY" as const,
        latencyMs: 0,
        details: { connectivity: "configured" },
        checkedAt: now,
      },
      {
        organizationId,
        service: "automation-worker",
        checkType,
        status: "DEGRADED" as const,
        latencyMs: 0,
        details: { status: "external worker heartbeat pending" },
        checkedAt: now,
      },
    ];

    return Promise.all(checks.map((check) => this.healthChecks.create(check)));
  }
}

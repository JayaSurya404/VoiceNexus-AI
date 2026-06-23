export type HealthCheckStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";

export interface HealthCheck {
  id: string;
  organizationId: string | null;
  service: string;
  checkType: "HEALTH" | "LIVENESS" | "READINESS";
  status: HealthCheckStatus;
  latencyMs: number;
  details: Record<string, unknown>;
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

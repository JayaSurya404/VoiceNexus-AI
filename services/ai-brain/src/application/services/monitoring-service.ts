import type { ProductionOverview } from "../ports.js";
import type { AlertingService } from "./alerting-service.js";
import type { DistributedLockService } from "./distributed-lock-service.js";
import type { ErrorTrackingService } from "./error-tracking-service.js";
import type { HealthCheckService } from "./health-check-service.js";
import type { MetricsService } from "./metrics-service.js";
import type { ResilienceService } from "./resilience-service.js";

export class MonitoringService {
  constructor(
    private readonly healthChecks: HealthCheckService,
    private readonly metrics: MetricsService,
    private readonly errors: ErrorTrackingService,
    private readonly alerts: AlertingService,
    private readonly resilience: ResilienceService,
    private readonly locks: DistributedLockService,
  ) {}

  async overview(organizationId: string | null = null): Promise<ProductionOverview> {
    const [health, readiness, systemMetrics, applicationMetrics, incidents, alertEvents, breakers, locks] =
      await Promise.all([
        this.healthChecks.health(organizationId),
        this.healthChecks.readiness(organizationId),
        this.metrics.latest("SYSTEM", organizationId),
        this.metrics.latest("APPLICATION", organizationId),
        this.errors.incidents(organizationId),
        this.alerts.events(organizationId),
        this.resilience.breakers(organizationId),
        this.locks.list(organizationId),
      ]);

    return {
      healthStatus: health.status,
      readinessStatus: readiness.status,
      livenessStatus: "ALIVE",
      activeAlerts: alertEvents.filter((alert) => alert.status === "OPEN").length,
      openIncidents: incidents.filter((incident) => incident.status !== "RESOLVED").length,
      circuitBreakersOpen: breakers.filter((breaker) => breaker.state === "OPEN").length,
      activeLocks: locks.filter((lock) => !lock.releasedAt && lock.expiresAt > new Date()).length,
      latestSystemMetrics: systemMetrics[0]?.metrics ?? {},
      latestApplicationMetrics: applicationMetrics[0]?.metrics ?? {},
    };
  }
}

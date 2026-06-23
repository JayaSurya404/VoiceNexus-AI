"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AlertEventDto,
  AlertRuleDto,
  CircuitBreakerDto,
  DistributedLockDto,
  ErrorEventDto,
  ErrorIncidentDto,
  EventLogDto,
  FallbackStrategyDto,
  HealthStatusDto,
  LivenessStatusDto,
  MetricDto,
  MetricSnapshotDto,
  ProductionOverviewDto,
  ReadinessStatusDto,
  RetryPolicyDto,
  TraceDto,
} from "@/lib/api/ai-brain-api";

type Props = {
  alertEvents: AlertEventDto[];
  alertRules: AlertRuleDto[];
  applicationMetrics?: MetricSnapshotDto;
  circuitBreakers: CircuitBreakerDto[];
  distributedLocks: DistributedLockDto[];
  errorEvents: ErrorEventDto[];
  errorIncidents: ErrorIncidentDto[];
  fallbackStrategies: FallbackStrategyDto[];
  health?: HealthStatusDto;
  liveness?: LivenessStatusDto;
  metrics: MetricDto[];
  monitoring?: ProductionOverviewDto;
  observabilityEvents: EventLogDto[];
  readiness?: ReadinessStatusDto;
  retryPolicies: RetryPolicyDto[];
  systemMetrics?: MetricSnapshotDto;
  traces: TraceDto[];
};

const formatNumber = (value: number) => value.toLocaleString();

const statusVariant = (value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (["UNHEALTHY", "NOT_READY", "ERROR", "CRITICAL", "HIGH", "OPEN"].includes(value)) {
    return "destructive";
  }
  if (["DEGRADED", "WARN", "MEDIUM", "HALF_OPEN"].includes(value)) {
    return "secondary";
  }
  if (["HEALTHY", "READY", "ALIVE", "OK", "CLOSED", "RESOLVED"].includes(value)) {
    return "default";
  }
  return "outline";
};

function MetricCard({ label, value, detail }: { detail: string; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

export function ProductionHardeningPanels({
  alertEvents,
  alertRules,
  applicationMetrics,
  circuitBreakers,
  distributedLocks,
  errorEvents,
  errorIncidents,
  fallbackStrategies,
  health,
  liveness,
  metrics,
  monitoring,
  observabilityEvents,
  readiness,
  retryPolicies,
  systemMetrics,
  traces,
}: Props) {
  const activeLocks = distributedLocks.filter((lock) => !lock.releasedAt && new Date(lock.expiresAt) > new Date());
  const openAlerts = alertEvents.filter((alert) => alert.status === "OPEN");
  const openIncidents = errorIncidents.filter((incident) => incident.status !== "RESOLVED");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Production Hardening</h2>
        <p className="text-sm text-muted-foreground">
          Health, readiness, metrics, incidents, alerts, resilience controls, locks, and diagnostic event streams.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`Readiness ${readiness?.status ?? monitoring?.readinessStatus ?? "pending"}`}
          label="Health Overview"
          value={health?.status ?? monitoring?.healthStatus ?? "UNKNOWN"}
        />
        <MetricCard
          detail="Open alert events"
          label="Alerts"
          value={formatNumber(monitoring?.activeAlerts ?? openAlerts.length)}
        />
        <MetricCard
          detail="Open error incidents"
          label="Incidents"
          value={formatNumber(monitoring?.openIncidents ?? openIncidents.length)}
        />
        <MetricCard
          detail={`Uptime ${formatNumber(liveness?.uptimeSeconds ?? 0)}s`}
          label="Distributed Locks"
          value={formatNumber(monitoring?.activeLocks ?? activeLocks.length)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(health?.checks ?? []).length === 0 ? (
              <EmptyState label="Health checks have not reported yet." />
            ) : (
              health?.checks.map((check) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={check.id}>
                  <div>
                    <p className="font-medium">{check.service}</p>
                    <p className="text-sm text-muted-foreground">{check.checkType}</p>
                  </div>
                  <Badge variant={statusVariant(check.status)}>{check.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(systemMetrics?.metrics ?? monitoring?.latestSystemMetrics ?? {}).length === 0 ? (
              <EmptyState label="No system metrics are available." />
            ) : (
              Object.entries(systemMetrics?.metrics ?? monitoring?.latestSystemMetrics ?? {})
                .slice(0, 8)
                .map(([name, value]) => (
                  <div className="rounded-md border p-3" key={name}>
                    <p className="text-sm text-muted-foreground">{name}</p>
                    <p className="mt-1 font-medium">{formatNumber(value)}</p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(applicationMetrics?.metrics ?? monitoring?.latestApplicationMetrics ?? {}).length === 0 ? (
              <EmptyState label="No application metrics are available." />
            ) : (
              Object.entries(applicationMetrics?.metrics ?? monitoring?.latestApplicationMetrics ?? {})
                .slice(0, 8)
                .map(([name, value]) => (
                  <div className="rounded-md border p-3" key={name}>
                    <p className="text-sm text-muted-foreground">{name}</p>
                    <p className="mt-1 font-medium">{formatNumber(value)}</p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorEvents.length === 0 ? (
              <EmptyState label="No error events have been captured." />
            ) : (
              errorEvents.slice(0, 6).map((event) => (
                <div className="rounded-md border p-3" key={event.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{event.service}</p>
                    <Badge variant={statusVariant(event.severity)}>{event.severity}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorIncidents.length === 0 ? (
              <EmptyState label="No incidents are open." />
            ) : (
              errorIncidents.slice(0, 6).map((incident) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={incident.id}>
                  <div>
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-muted-foreground">{incident.eventCount} events</p>
                  </div>
                  <Badge variant={statusVariant(incident.status)}>{incident.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertEvents.length === 0 && alertRules.length === 0 ? (
              <EmptyState label="No alert activity is available." />
            ) : (
              [...alertEvents.slice(0, 4), ...alertRules.slice(0, 2)].map((alert) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={alert.id}>
                  <div>
                    <p className="font-medium">{"title" in alert ? alert.title : alert.name}</p>
                    <p className="text-sm text-muted-foreground">{alert.trigger}</p>
                  </div>
                  <Badge variant={statusVariant(alert.severity)}>{alert.severity}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circuit Breakers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {circuitBreakers.length === 0 ? (
              <EmptyState label="No circuit breakers are configured." />
            ) : (
              circuitBreakers.map((breaker) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={breaker.id}>
                  <div>
                    <p className="font-medium">{breaker.provider}</p>
                    <p className="text-sm text-muted-foreground">{breaker.failureCount} failures</p>
                  </div>
                  <Badge variant={statusVariant(breaker.state)}>{breaker.state}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {retryPolicies.length === 0 ? (
              <EmptyState label="No retry policies are configured." />
            ) : (
              retryPolicies.map((policy) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={policy.id}>
                  <div>
                    <p className="font-medium">{policy.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {policy.maxAttempts} attempts · {policy.backoffMs}ms backoff
                    </p>
                  </div>
                  <Badge variant={policy.active ? "default" : "outline"}>{policy.active ? "ACTIVE" : "INACTIVE"}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distributed Locks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {distributedLocks.length === 0 ? (
              <EmptyState label="No distributed locks are active." />
            ) : (
              distributedLocks.slice(0, 6).map((lock) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={lock.id}>
                  <div>
                    <p className="font-medium">{lock.lockKey}</p>
                    <p className="text-sm text-muted-foreground">{lock.purpose}</p>
                  </div>
                  <Badge variant={lock.releasedAt ? "outline" : "secondary"}>{lock.releasedAt ? "RELEASED" : "HELD"}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {traces.length === 0 && observabilityEvents.length === 0 && metrics.length === 0 && fallbackStrategies.length === 0 ? (
              <EmptyState label="No traces, events, or diagnostic metrics are available." />
            ) : (
              <>
                {traces.slice(0, 3).map((trace) => (
                  <div className="rounded-md border p-3" key={trace.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{trace.name}</p>
                      <Badge variant={statusVariant(trace.status)}>{trace.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{trace.traceId}</p>
                  </div>
                ))}
                {observabilityEvents.slice(0, 3).map((event) => (
                  <div className="rounded-md border p-3" key={event.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.eventName}</p>
                      <Badge variant={statusVariant(event.severity)}>{event.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

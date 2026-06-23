"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  BackupJobDto,
  BackupSnapshotDto,
  ConfigurationIssueDto,
  DeploymentEnvironmentDto,
  DeploymentEventDto,
  DisasterRecoveryPlanDto,
  EnvironmentValidationDto,
  LaunchStatusDto,
  RecoveryPlanDto,
  ReleaseChecklistDto,
  ReleaseReadinessDto,
  SecurityFindingDto,
  StartupCheckDto,
  DeploymentReadinessOverviewDto,
} from "@/lib/api/ai-brain-api";

type Props = {
  backups: BackupJobDto[];
  configuration: ConfigurationIssueDto[];
  deploymentEvents: DeploymentEventDto[];
  disasterRecovery: DisasterRecoveryPlanDto[];
  environments: DeploymentEnvironmentDto[];
  launch?: LaunchStatusDto;
  readiness?: { readiness: ReleaseReadinessDto; overview: DeploymentReadinessOverviewDto };
  recoveryPlans: RecoveryPlanDto[];
  releaseChecklist: ReleaseChecklistDto[];
  securityFindings: SecurityFindingDto[];
  snapshots: BackupSnapshotDto[];
  startupChecks: StartupCheckDto[];
  validations: EnvironmentValidationDto[];
};

const variant = (value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (["NO_GO", "BLOCKED", "FAIL", "FAILED", "CRITICAL", "HIGH", "NOT_READY"].includes(value)) return "destructive";
  if (["GO_WITH_CAUTION", "WARN", "MEDIUM", "PARTIAL", "AT_RISK", "VALIDATING"].includes(value)) return "secondary";
  if (["GO", "READY", "PASS", "COMPLETED", "SUCCEEDED", "LAUNCHED"].includes(value)) return "default";
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

export function DeploymentReadinessPanels({
  backups,
  configuration,
  deploymentEvents,
  disasterRecovery,
  environments,
  launch,
  readiness,
  recoveryPlans,
  releaseChecklist,
  securityFindings,
  snapshots,
  startupChecks,
  validations,
}: Props) {
  const overview = readiness?.overview;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Deployment & Launch Readiness</h2>
        <p className="text-sm text-muted-foreground">
          Environment validation, startup checks, configuration, security, backups, recovery, release checklist, and launch go/no-go.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="Calculated release score" label="Release Readiness Score" value={`${overview?.readinessScore ?? 0}%`} />
        <MetricCard detail="Deployment blockers" label="Blockers" value={`${overview?.blockerCount ?? 0}`} />
        <MetricCard detail="Launch state" label="Launch Dashboard" value={launch?.state ?? overview?.launchState ?? "PLANNING"} />
        <MetricCard detail="Security findings" label="Security Review" value={`${overview?.securityFindingCount ?? securityFindings.length}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Deployment Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {environments.length === 0 ? <EmptyState label="No deployment environments have been registered." /> : environments.map((environment) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={environment.id}>
                <div><p className="font-medium">{environment.name}</p><p className="text-sm text-muted-foreground">{environment.region}</p></div>
                <Badge variant={environment.active ? "default" : "outline"}>{environment.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Environment Validation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {validations.length === 0 ? <EmptyState label="No environment validation has run." /> : validations.slice(0, 8).map((item) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={item.id}>
                <div><p className="font-medium">{item.key}</p><p className="text-sm text-muted-foreground">{item.message}</p></div>
                <Badge variant={item.valid ? "default" : variant(item.severity)}>{item.valid ? "VALID" : item.severity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Startup Checks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {startupChecks.length === 0 ? <EmptyState label="No startup checks have run." /> : startupChecks.map((check) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={check.id}>
                <div><p className="font-medium">{check.service}</p><p className="text-sm text-muted-foreground">{check.message}</p></div>
                <Badge variant={variant(check.status)}>{check.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Configuration Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {configuration.length === 0 ? <EmptyState label="No configuration issues were detected." /> : configuration.slice(0, 8).map((issue) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={issue.id}>
                <div><p className="font-medium">{issue.key}</p><p className="text-sm text-muted-foreground">{issue.message}</p></div>
                <Badge variant={issue.resolved ? "default" : variant(issue.severity)}>{issue.issueType}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Backup Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {backups.length === 0 ? <EmptyState label="No backup jobs are configured." /> : backups.map((job) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={job.id}>
                <div><p className="font-medium">{job.name}</p><p className="text-sm text-muted-foreground">{job.schedule}</p></div>
                <Badge variant={job.enabled ? "default" : "outline"}>{job.target}</Badge>
              </div>
            ))}
            {snapshots.slice(0, 3).map((snapshot) => <p className="text-sm text-muted-foreground" key={snapshot.id}>{snapshot.target} snapshot {snapshot.status}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recovery Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[...recoveryPlans, ...disasterRecovery].length === 0 ? <EmptyState label="No recovery plans are available." /> : (
              <>
                {recoveryPlans.map((plan) => <div className="rounded-md border p-3" key={plan.id}><p className="font-medium">{plan.name}</p><p className="text-sm text-muted-foreground">RTO {plan.rtoMinutes}m · RPO {plan.rpoMinutes}m</p></div>)}
                {disasterRecovery.map((plan) => <div className="flex items-center justify-between rounded-md border p-3" key={plan.id}><p className="font-medium">{plan.name}</p><Badge variant={variant(plan.continuityStatus)}>{plan.continuityStatus}</Badge></div>)}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Release Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {releaseChecklist.length === 0 ? <EmptyState label="No release checklist items are available." /> : releaseChecklist.map((item) => (
              <div className="flex items-center justify-between rounded-md border p-3" key={item.id}>
                <p className="font-medium">{item.name}</p>
                <Badge variant={item.completed ? "default" : item.required ? "destructive" : "outline"}>{item.completed ? "DONE" : "PENDING"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Deployment Events</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {deploymentEvents.length === 0 ? <EmptyState label="No deployment events have been recorded." /> : deploymentEvents.slice(0, 8).map((event) => (
              <div className="rounded-md border p-3" key={event.id}>
                <div className="flex items-center justify-between"><p className="font-medium">{event.service}</p><Badge variant={variant(event.status)}>{event.status}</Badge></div>
                <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

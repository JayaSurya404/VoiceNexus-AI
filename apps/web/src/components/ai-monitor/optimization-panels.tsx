"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  OptimizationActionDto,
  OptimizationEventDto,
  OptimizationExperimentDto,
  OptimizationGoalDto,
  OptimizationMetricDto,
  OptimizationOverviewDto,
  OptimizationRecommendationDto,
  OptimizationResultDto,
  OptimizationRuleDto,
} from "@/lib/api/ai-brain-api";

type OptimizationPanelsProps = {
  actions: OptimizationActionDto[];
  events: OptimizationEventDto[];
  experiments: OptimizationExperimentDto[];
  goals: OptimizationGoalDto[];
  metrics: OptimizationMetricDto[];
  overview?: OptimizationOverviewDto;
  recommendations: OptimizationRecommendationDto[];
  results: OptimizationResultDto[];
  rules: OptimizationRuleDto[];
};

const formatNumber = (value: number, suffix = "") => `${value.toLocaleString()}${suffix}`;

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const formatSignedPercent = (value: number) => `${value >= 0 ? "+" : ""}${Math.round(value)}%`;

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (["FAILED", "REJECTED", "BREACHED"].includes(status)) {
    return "destructive";
  }

  if (["COMPLETED", "APPROVED", "ACHIEVED", "IMPROVED"].includes(status)) {
    return "default";
  }

  if (["IN_PROGRESS", "RUNNING", "TESTING", "WATCH"].includes(status)) {
    return "secondary";
  }

  return "outline";
};

function MetricCard({
  label,
  value,
  detail,
}: {
  detail: string;
  label: string;
  value: string;
}) {
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

export function OptimizationPanels({
  actions,
  events,
  experiments,
  goals,
  metrics,
  overview,
  recommendations,
  results,
  rules,
}: OptimizationPanelsProps) {
  const openRecommendations = recommendations.filter(
    (recommendation) => recommendation.status === "OPEN",
  );
  const impactedResults = results.filter((result) => result.impactPercent > 0);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Autonomous Optimization</h2>
        <p className="text-sm text-muted-foreground">
          KPI monitoring, recommendations, actions, experiments, and self-healing impact.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail="Open AI optimization opportunities"
          label="Active Recommendations"
          value={formatNumber(overview?.activeRecommendationCount ?? openRecommendations.length)}
        />
        <MetricCard
          detail="Optimization actions created"
          label="Actions Taken"
          value={formatNumber(overview?.pendingActionCount ?? actions.length)}
        />
        <MetricCard
          detail="Metrics currently over threshold"
          label="KPI Impact"
          value={formatNumber(overview?.breachedMetricCount ?? metrics.length)}
        />
        <MetricCard
          detail="Average measured optimization impact"
          label="Results"
          value={
            overview
              ? formatSignedPercent(overview.averageImpact)
              : formatNumber(impactedResults.length)
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Optimization Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.length === 0 ? (
              <EmptyState label="No optimization metrics are available yet." />
            ) : (
              metrics.slice(0, 5).map((metric) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={metric.id}
                >
                  <div>
                    <p className="font-medium">{metric.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {metric.scope} target {formatNumber(metric.target)} {metric.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusVariant(metric.status)}>{metric.status}</Badge>
                    <p className="mt-1 text-sm font-medium">{formatNumber(metric.value)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openRecommendations.length === 0 ? (
              <EmptyState label="No active optimization recommendations." />
            ) : (
              openRecommendations.slice(0, 5).map((recommendation) => (
                <div className="rounded-md border p-3" key={recommendation.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
                    </div>
                    <Badge variant={statusVariant(recommendation.status)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Confidence {formatPercent(recommendation.confidence)} · Expected impact{" "}
                    {formatNumber(recommendation.expectedImpact)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.length === 0 ? (
              <EmptyState label="No optimization goals have been configured." />
            ) : (
              goals.slice(0, 5).map((goal) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={goal.id}
                >
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {goal.targetMetric}: {formatNumber(goal.currentValue)} to{" "}
                      {formatNumber(goal.targetValue)}
                      {goal.dueAt ? ` by ${new Date(goal.dueAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Badge variant={statusVariant(goal.status)}>{goal.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {experiments.length === 0 ? (
              <EmptyState label="No optimization experiments are running." />
            ) : (
              experiments.slice(0, 5).map((experiment) => (
                <div className="rounded-md border p-3" key={experiment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{experiment.name}</p>
                      <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
                    </div>
                    <Badge variant={statusVariant(experiment.status)}>{experiment.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Baseline {formatNumber(experiment.baselineMetric)} · Target{" "}
                    {formatNumber(experiment.targetMetric)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Taken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actions.length === 0 ? (
              <EmptyState label="No optimization actions have been created." />
            ) : (
              actions.slice(0, 5).map((action) => (
                <div className="rounded-md border p-3" key={action.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <Badge variant={statusVariant(action.status)}>{action.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {action.scope} action · Impact {formatNumber(action.impactScore)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 ? (
              <EmptyState label="No optimization results have been measured." />
            ) : (
              results.slice(0, 5).map((result) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={result.id}
                >
                  <div>
                    <p className="font-medium">{result.summary}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.metric}: {formatNumber(result.beforeValue)} to{" "}
                      {formatNumber(result.afterValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{result.metric}</Badge>
                    <p className="mt-1 text-sm font-medium">
                      Impact {formatSignedPercent(result.impactPercent)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Self-Healing Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <EmptyState label="No self-healing optimization events have been recorded." />
            ) : (
              events.slice(0, 5).map((event) => (
                <div className="rounded-md border p-3" key={event.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.type}</p>
                      <p className="text-sm text-muted-foreground">{event.message}</p>
                    </div>
                    <Badge variant={statusVariant(event.severity)}>{event.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{event.source}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.length === 0 ? (
              <EmptyState label="No optimization rules are configured." />
            ) : (
              rules.slice(0, 5).map((rule) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={rule.id}
                >
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {rule.scope} · Priority {formatNumber(rule.priority)} · {rule.action}
                    </p>
                  </div>
                  <Badge variant={rule.active ? "default" : "outline"}>
                    {rule.active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

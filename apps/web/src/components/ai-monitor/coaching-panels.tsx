import type {
  AgentCoachingInsightDto,
  AgentCoachingSessionDto,
  AgentRecommendationDto,
  CoachingEffectivenessMetricsDto,
  ComplianceAlertDto,
  ConversationScorecardDto,
  NextBestActionDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachingMonitorPanel({
  alerts,
  insights,
  metrics,
  recommendations,
  scorecards,
  sessions,
  nextBestActions,
}: Readonly<{
  alerts: ComplianceAlertDto[];
  insights: AgentCoachingInsightDto[];
  metrics: CoachingEffectivenessMetricsDto | undefined;
  recommendations: AgentRecommendationDto[];
  scorecards: ConversationScorecardDto[];
  sessions: AgentCoachingSessionDto[];
  nextBestActions: NextBestActionDto[];
}>) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Acceptance rate" value={`${Math.round((metrics?.coachingAcceptanceRate ?? 0) * 100)}%`} />
        <Metric label="Recommendation usage" value={`${Math.round((metrics?.recommendationUsage ?? 0) * 100)}%`} />
        <Metric label="Improvement trend" value={`${Math.round(metrics?.agentImprovementTrend ?? 0)}/100`} />
        <Metric label="Effectiveness" value={`${Math.round((metrics?.coachingEffectiveness ?? 0) * 100)}%`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coaching sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.slice(0, 6).map((session) => (
              <div className="rounded-2xl border p-4" key={session.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Session {session.id.slice(-8)}</p>
                  <Badge variant={session.status === "ACTIVE" ? "default" : "outline"}>{session.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Agent {session.agentId.slice(-8)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(session.startedAt).toLocaleString()}</p>
              </div>
            ))}
            {!sessions.length ? <p className="text-sm text-muted-foreground">Real-time coaching sessions will appear here.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coaching insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 6).map((insight) => (
              <div className="rounded-2xl border p-4" key={insight.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{insight.type.replaceAll("_", " ")}</p>
                  <Badge variant="outline">{Math.round(insight.confidence * 100)}%</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{insight.message}</p>
              </div>
            ))}
            {!insights.length ? <p className="text-sm text-muted-foreground">No coaching insights captured yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Compliance alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 6).map((alert) => (
              <div className="rounded-2xl border p-4" key={alert.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{alert.type.replaceAll("_", " ")}</p>
                  <Badge variant={alert.severity === "CRITICAL" || alert.severity === "HIGH" ? "destructive" : "outline"}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
              </div>
            ))}
            {!alerts.length ? <p className="text-sm text-muted-foreground">No compliance alerts detected.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scorecards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scorecards.slice(0, 6).map((scorecard) => (
              <div className="rounded-2xl border p-4" key={scorecard.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Scorecard {scorecard.id.slice(-8)}</p>
                  <Badge variant="outline">{scorecard.overallScore}/100</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Discovery {scorecard.discoveryQuality} / compliance {scorecard.complianceScore} / close {scorecard.closingEffectiveness}
                </p>
              </div>
            ))}
            {!scorecards.length ? <p className="text-sm text-muted-foreground">Conversation scorecards will appear after coaching analysis.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next best actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextBestActions.slice(0, 6).map((action) => (
              <div className="rounded-2xl border p-4" key={action.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{action.label}</p>
                  <Badge variant={action.completed ? "default" : "outline"}>{action.priority}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{action.rationale}</p>
              </div>
            ))}
            {!nextBestActions.length ? <p className="text-sm text-muted-foreground">No next best actions generated yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation feed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {recommendations.slice(0, 8).map((recommendation) => (
            <div className="rounded-2xl border p-4" key={recommendation.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{recommendation.title}</p>
                <Badge variant={recommendation.used ? "default" : "outline"}>{recommendation.type.replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
          ))}
          {!recommendations.length ? <p className="text-sm text-muted-foreground">No agent recommendations available.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

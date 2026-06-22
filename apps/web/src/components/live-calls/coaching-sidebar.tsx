import type {
  AgentRecommendationDto,
  ComplianceAlertDto,
  ConversationScorecardDto,
  NextBestActionDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachingSidebar({
  alerts,
  recommendations,
  scorecards,
  nextBestActions,
}: Readonly<{
  alerts: ComplianceAlertDto[];
  recommendations: AgentRecommendationDto[];
  scorecards: ConversationScorecardDto[];
  nextBestActions: NextBestActionDto[];
}>) {
  const latestScorecard = scorecards[0];

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Coaching sidebar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.slice(0, 4).map((recommendation) => (
            <div className="rounded-2xl border p-3" key={recommendation.id}>
              <p className="font-medium">{recommendation.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
          ))}
          {!recommendations.length ? <p className="text-sm text-muted-foreground">No live coaching recommendations.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance warnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.slice(0, 4).map((alert) => (
            <div className="rounded-2xl border p-3" key={alert.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{alert.type.replaceAll("_", " ")}</p>
                <Badge variant={alert.severity === "CRITICAL" || alert.severity === "HIGH" ? "destructive" : "outline"}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
            </div>
          ))}
          {!alerts.length ? <p className="text-sm text-muted-foreground">No compliance warnings.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scorecard panel</CardTitle>
        </CardHeader>
        <CardContent>
          {latestScorecard ? (
            <div className="rounded-2xl border p-3">
              <p className="text-3xl font-semibold">{latestScorecard.overallScore}/100</p>
              <p className="mt-2 text-sm text-muted-foreground">{latestScorecard.reasoning}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scorecard captured yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next best action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextBestActions.slice(0, 4).map((action) => (
            <div className="rounded-2xl border p-3" key={action.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{action.label}</p>
                <Badge variant="outline">{action.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{action.rationale}</p>
            </div>
          ))}
          {!nextBestActions.length ? <p className="text-sm text-muted-foreground">No next best action available.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

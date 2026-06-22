import type {
  AgentPerformanceDto,
  AnalyticsOverviewDto,
  CallOutcomeDto,
  ConversionAnalyticsDto,
  HumanAgentDto,
  QualityScoreDto,
  QueueAnalyticsDto,
  QueueDto,
  SentimentAnalysisDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AnalyticsDashboard({ overview }: Readonly<{ overview: AnalyticsOverviewDto | undefined }>) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <MetricCard label="AI performance" value={percent(overview?.aiPerformance ?? 0)} />
      <MetricCard label="Human performance" value={percent(overview?.humanPerformance ?? 0)} />
      <MetricCard label="Queue performance" value={percent(overview?.queuePerformance ?? 0)} />
      <MetricCard label="Workflow effectiveness" value={percent(overview?.workflowEffectiveness ?? 0)} />
      <MetricCard label="Lead conversion" value={percent(overview?.leadConversionRate ?? 0)} />
      <MetricCard label="Qualification accuracy" value={percent(overview?.qualificationAccuracy ?? 0)} />
      <MetricCard label="Call outcome rate" value={percent(overview?.callOutcomeRate ?? 0)} />
      <MetricCard label="Agent productivity" value={Math.round(overview?.agentProductivity ?? 0)} />
    </section>
  );
}

export function QualityDashboard({ qualityScores }: Readonly<{ qualityScores: QualityScoreDto[] }>) {
  const latest = qualityScores.slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>QA dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest.map((score) => (
          <div className="rounded-2xl border p-4" key={score.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Conversation {score.conversationId.slice(-8)}</p>
              <Badge variant={score.overallScore >= 75 ? "default" : "outline"}>{Math.round(score.overallScore)}/100</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <MiniMetric label="Greeting" value={Math.round(score.greetingQuality)} />
              <MiniMetric label="Discovery" value={Math.round(score.discoveryQuality)} />
              <MiniMetric label="Qualification" value={Math.round(score.qualificationQuality)} />
              <MiniMetric label="Objection" value={Math.round(score.objectionHandling)} />
              <MiniMetric label="Compliance" value={Math.round(score.complianceScore)} />
              <MiniMetric label="Closing" value={Math.round(score.closingQuality)} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{score.reasoning}</p>
          </div>
        ))}
        {!latest.length ? <p className="text-sm text-muted-foreground">QA scores will appear after conversations are analyzed.</p> : null}
      </CardContent>
    </Card>
  );
}

export function AgentPerformanceAnalyticsPanel({
  agents,
  performance,
}: Readonly<{ agents: HumanAgentDto[]; performance: AgentPerformanceDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Avg duration</TableHead>
              <TableHead>QA</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Transfers</TableHead>
              <TableHead>Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.map((item) => {
              const agent = agents.find((candidate) => candidate.id === item.agentId);
              return (
                <TableRow key={item.id}>
                  <TableCell>{agent?.name ?? item.agentId.slice(-8)}</TableCell>
                  <TableCell>{item.callsHandled}</TableCell>
                  <TableCell>{Math.round(item.averageDuration)}s</TableCell>
                  <TableCell>{Math.round(item.averageQaScore)}</TableCell>
                  <TableCell>{item.averageSentiment.toFixed(2)}</TableCell>
                  <TableCell>{item.transfers}</TableCell>
                  <TableCell>{item.conversions}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function QueueAnalyticsPanel({
  analytics,
  queues,
}: Readonly<{ analytics: QueueAnalyticsDto[]; queues: QueueDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {analytics.map((item) => {
          const queue = queues.find((candidate) => candidate.id === item.queueId);
          return (
            <div className="rounded-2xl border p-4" key={item.id}>
              <p className="font-medium">{queue?.name ?? item.queueId.slice(-8)}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <MiniMetric label="Wait" value={`${Math.round(item.waitTime)}s`} />
                <MiniMetric label="Abandon" value={percent(item.abandonmentRate)} />
                <MiniMetric label="Transfer" value={percent(item.transferRate)} />
                <MiniMetric label="Escalation" value={percent(item.escalationRate)} />
                <MiniMetric label="Resolution" value={percent(item.resolutionRate)} />
                <MiniMetric label="Sessions" value={item.sessionsHandled} />
              </div>
            </div>
          );
        })}
        {!analytics.length ? <p className="text-sm text-muted-foreground">Queue analytics will appear after queue sessions are created.</p> : null}
      </CardContent>
    </Card>
  );
}

export function SentimentTrendsPanel({ sentiments }: Readonly<{ sentiments: SentimentAnalysisDto[] }>) {
  const positive = sentiments.filter((item) => item.sentiment === "POSITIVE").length;
  const neutral = sentiments.filter((item) => item.sentiment === "NEUTRAL").length;
  const negative = sentiments.filter((item) => item.sentiment === "NEGATIVE").length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <MiniMetric label="Positive" value={positive} />
          <MiniMetric label="Neutral" value={neutral} />
          <MiniMetric label="Negative" value={negative} />
        </div>
        {sentiments.slice(0, 6).map((item) => (
          <div className="rounded-2xl border p-4" key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={item.sentiment === "NEGATIVE" ? "destructive" : item.sentiment === "POSITIVE" ? "default" : "outline"}>
                {item.sentiment}
              </Badge>
              <span className="text-xs text-muted-foreground">{Math.round(item.confidence * 100)}% confidence</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.reasoning}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ConversionFunnelPanel({ conversions }: Readonly<{ conversions: ConversionAnalyticsDto | undefined }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion funnel</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <MiniMetric label="HOT leads" value={conversions?.hotLeads ?? 0} />
        <MiniMetric label="WARM leads" value={conversions?.warmLeads ?? 0} />
        <MiniMetric label="COLD leads" value={conversions?.coldLeads ?? 0} />
        <MiniMetric label="Overall conversion" value={percent(conversions?.overallConversionRate ?? 0)} />
        <MiniMetric label="HOT conversion" value={percent(conversions?.hotConversionRate ?? 0)} />
        <MiniMetric label="WARM conversion" value={percent(conversions?.warmConversionRate ?? 0)} />
        <MiniMetric label="COLD conversion" value={percent(conversions?.coldConversionRate ?? 0)} />
      </CardContent>
    </Card>
  );
}

export function CallOutcomesPanel({ outcomes }: Readonly<{ outcomes: CallOutcomeDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call outcomes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {outcomes.slice(0, 8).map((outcome) => (
          <div className="rounded-2xl border p-4" key={outcome.id}>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={outcome.outcome === "FAILED" || outcome.outcome === "NO_INTEREST" ? "destructive" : "default"}>
                {outcome.outcome.replaceAll("_", " ")}
              </Badge>
              <span className="text-xs text-muted-foreground">{new Date(outcome.occurredAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{outcome.reasoning}</p>
          </div>
        ))}
        {!outcomes.length ? <p className="text-sm text-muted-foreground">Call outcomes will appear after conversations are analyzed.</p> : null}
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: Readonly<{ label: string; value: number | string }>) {
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

function MiniMetric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

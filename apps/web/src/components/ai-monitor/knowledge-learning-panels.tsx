import type {
  KnowledgeGapDto,
  KnowledgeImprovementDto,
  KnowledgeLearningEventDto,
  KnowledgeSuggestionDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function KnowledgeImprovementPanel({
  improvements,
}: Readonly<{ improvements: KnowledgeImprovementDto[] }>) {
  const latest = improvements[0];
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric label="Knowledge quality" value={`${Math.round(latest?.knowledgeQualityScore ?? 0)}/100`} />
      <Metric label="Coverage score" value={`${Math.round(latest?.coverageScore ?? 0)}/100`} />
      <Metric label="Retrieval success" value={`${Math.round((latest?.retrievalSuccessRate ?? 0) * 100)}%`} />
      <Metric label="Gap severity" value={`${Math.round(latest?.gapSeverityScore ?? 0)}/100`} />
    </section>
  );
}

export function KnowledgeGapDashboard({ gaps }: Readonly<{ gaps: KnowledgeGapDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap dashboard</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {gaps.slice(0, 9).map((gap) => (
          <div className="rounded-2xl border p-4" key={gap.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{gap.topic}</p>
              <Badge variant={gap.severityScore >= 70 ? "destructive" : "outline"}>{Math.round(gap.severityScore)}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{gap.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {gap.triggerCount} signals / {gap.unansweredCount} unanswered / {gap.escalationCount} escalations
            </p>
          </div>
        ))}
        {!gaps.length ? <p className="text-sm text-muted-foreground">Knowledge gaps will appear after low-confidence retrieval or feedback.</p> : null}
      </CardContent>
    </Card>
  );
}

export function KnowledgeSuggestionsDashboard({
  onApprove,
  onReject,
  suggestions,
}: Readonly<{
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  suggestions: KnowledgeSuggestionDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestions dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 8).map((suggestion) => (
          <div className="rounded-2xl border p-4" key={suggestion.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{suggestion.title}</p>
              <Badge variant={suggestion.status === "PENDING" ? "outline" : "default"}>{suggestion.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{suggestion.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">{suggestion.rationale}</p>
            <div className="mt-3 flex gap-2">
              <Button disabled={suggestion.status !== "PENDING"} onClick={() => onApprove(suggestion.id)} size="sm">
                Approve
              </Button>
              <Button disabled={suggestion.status !== "PENDING"} onClick={() => onReject(suggestion.id)} size="sm" variant="outline">
                Reject
              </Button>
            </div>
          </div>
        ))}
        {!suggestions.length ? <p className="text-sm text-muted-foreground">Knowledge suggestions will appear after gap analysis.</p> : null}
      </CardContent>
    </Card>
  );
}

export function LearningEventsTimeline({ events }: Readonly<{ events: KnowledgeLearningEventDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning events timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.slice(0, 10).map((event) => (
          <div className="rounded-2xl border p-4" key={event.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{event.topic}</p>
              <Badge variant="outline">{event.triggerReason.replaceAll("_", " ")}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.round(event.confidence * 100)}% confidence / {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {!events.length ? <p className="text-sm text-muted-foreground">Learning activity will appear as the knowledge base improves.</p> : null}
      </CardContent>
    </Card>
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

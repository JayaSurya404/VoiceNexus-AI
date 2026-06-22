import type {
  AgentAssistSuggestionDto,
  AgentAvailabilityDto,
  HumanAgentDto,
  HumanAgentSessionDto,
  LiveTakeoverDto,
  SupervisorOverviewDto,
  WhisperMessageDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupervisorOverviewPanel({ overview }: Readonly<{ overview: SupervisorOverviewDto | undefined }>) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric label="Active calls" value={overview?.activeCalls ?? 0} />
      <Metric label="Active agents" value={overview?.activeAgents ?? 0} />
      <Metric label="Active takeovers" value={overview?.activeTakeovers ?? 0} />
      <Metric label="AI confidence" value={`${Math.round((overview?.averageAiConfidence ?? 0) * 100)}%`} />
    </section>
  );
}

export function AgentPanel({
  agents,
  availability,
}: Readonly<{ agents: HumanAgentDto[]; availability: AgentAvailabilityDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent panel & availability</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const current = availability.find((item) => item.agentId === agent.id);
          return (
            <div className="rounded-2xl border p-4" key={agent.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{agent.name}</p>
                <Badge variant={agent.status === "AVAILABLE" ? "default" : "outline"}>{agent.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{agent.email} · {agent.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Capacity {current?.activeSessionCount ?? 0}/{current?.capacity ?? 1}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{agent.skills.join(", ") || "No skills assigned"}</p>
            </div>
          );
        })}
        {!agents.length ? <p className="text-sm text-muted-foreground">No human agents configured yet.</p> : null}
      </CardContent>
    </Card>
  );
}

export function TakeoverPanel({
  onEnd,
  onStart,
  sessions,
  takeovers,
}: Readonly<{
  onEnd: (id: string) => void;
  onStart: (id: string) => void;
  sessions: HumanAgentSessionDto[];
  takeovers: LiveTakeoverDto[];
}>) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Session ownership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => (
            <div className="rounded-2xl border p-4" key={session.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Session {session.id.slice(-8)}</p>
                <Badge>{session.controller}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Agent {session.agentId.slice(-8)} · {session.status} · joined {new Date(session.joinedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {!sessions.length ? <p className="text-sm text-muted-foreground">No joined human-agent sessions yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live takeovers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {takeovers.map((takeover) => (
            <div className="rounded-2xl border p-4" key={takeover.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{takeover.reason}</p>
                <Badge variant={takeover.status === "ACTIVE" ? "destructive" : "outline"}>{takeover.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Agent {takeover.agentId.slice(-8)} · requested {new Date(takeover.requestedAt).toLocaleTimeString()}
              </p>
              <div className="mt-3 flex gap-2">
                <Button disabled={takeover.status === "ACTIVE" || takeover.status === "ENDED"} onClick={() => onStart(takeover.id)} size="sm">
                  Start
                </Button>
                <Button disabled={takeover.status === "ENDED"} onClick={() => onEnd(takeover.id)} size="sm" variant="outline">
                  Return to AI
                </Button>
              </div>
            </div>
          ))}
          {!takeovers.length ? <p className="text-sm text-muted-foreground">No takeover requests yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function WhisperAndAssistPanel({
  assist,
  onWhisperToAi,
  onWhisperToAgent,
  selectedAgentId,
  selectedSessionId,
  whispers,
}: Readonly<{
  assist: AgentAssistSuggestionDto | null | undefined;
  onWhisperToAi: (content: string) => void;
  onWhisperToAgent: (content: string) => void;
  selectedAgentId: string | null;
  selectedSessionId: string | null;
  whispers: WhisperMessageDto[];
}>) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Whisper feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!selectedSessionId}
              onClick={() => onWhisperToAi("Focus on clarifying budget, urgency, and decision authority.")}
              size="sm"
            >
              Whisper to AI
            </Button>
            <Button
              disabled={!selectedSessionId || !selectedAgentId}
              onClick={() => onWhisperToAgent("Acknowledge the concern, then ask one discovery question before pitching.")}
              size="sm"
              variant="outline"
            >
              Whisper to Agent
            </Button>
          </div>
          {whispers.slice(0, 8).map((whisper) => (
            <div className="rounded-2xl border p-4" key={whisper.id}>
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{whisper.senderRole} → {whisper.target}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(whisper.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{whisper.content}</p>
            </div>
          ))}
          {!whispers.length ? <p className="text-sm text-muted-foreground">Private supervisor and agent whispers will appear here.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI assist suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AssistList title="Suggested responses" items={assist?.suggestedResponses ?? []} />
          <AssistList title="Objection hints" items={assist?.objectionHints ?? []} />
          <AssistList title="Qualification insights" items={assist?.qualificationInsights ?? []} />
          <AssistList title="Recommended next actions" items={assist?.recommendedNextActions ?? []} />
          {!assist ? <p className="text-sm text-muted-foreground">Select an AI session to generate assist guidance.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AssistList({ items, title }: Readonly<{ items: string[]; title: string }>) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
        {!items.length ? <li>• No signal yet</li> : null}
      </ul>
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

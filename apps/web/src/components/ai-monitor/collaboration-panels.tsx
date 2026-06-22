import type {
  AgentDelegationDto,
  AgentTaskDto,
  AgentTeamDto,
  CollaborationsDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CollaborationMonitorPanel({
  collaborations,
  delegations,
  tasks,
  teams,
}: Readonly<{
  collaborations: CollaborationsDto | undefined;
  delegations: AgentDelegationDto[];
  tasks: AgentTaskDto[];
  teams: AgentTeamDto[];
}>) {
  const metrics = collaborations?.metrics;
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Delegations" value={metrics?.delegationCount ?? 0} />
        <Metric label="Success rate" value={`${Math.round((metrics?.collaborationSuccessRate ?? 0) * 100)}%`} />
        <Metric label="Avg confidence" value={`${Math.round((metrics?.averageConfidence ?? 0) * 100)}%`} />
        <Metric label="Resolution quality" value={`${Math.round(metrics?.resolutionQuality ?? 0)}/100`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent teams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teams.slice(0, 6).map((team) => (
              <div className="rounded-2xl border p-4" key={team.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{team.name}</p>
                  <Badge variant={team.active ? "default" : "outline"}>{team.active ? "ACTIVE" : "INACTIVE"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{team.description ?? "No description"}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {team.agents.length} agents / {team.objectives.length} objectives
                </p>
              </div>
            ))}
            {!teams.length ? <p className="text-sm text-muted-foreground">No AI agent teams configured yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(collaborations?.sessions ?? []).slice(0, 6).map((session) => (
              <div className="rounded-2xl border p-4" key={session.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Session {session.id.slice(-8)}</p>
                  <Badge variant={session.status === "COMPLETED" ? "default" : "outline"}>{session.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{session.customerRequest}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Confidence {Math.round(session.averageConfidence * 100)}% / quality {Math.round(session.resolutionQuality)}
                </p>
              </div>
            ))}
            {!collaborations?.sessions.length ? <p className="text-sm text-muted-foreground">Collaboration sessions will appear after multi-agent work runs.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Delegations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {delegations.slice(0, 6).map((delegation) => (
              <div className="rounded-2xl border p-4" key={delegation.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Delegation {delegation.id.slice(-8)}</p>
                  <Badge variant="outline">{delegation.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{delegation.task}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.slice(0, 6).map((task) => (
              <div className="rounded-2xl border p-4" key={task.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant={task.status === "FAILED" ? "destructive" : "outline"}>{task.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {task.assignedAgentType} / {Math.round(task.confidence * 100)}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supervisor decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(collaborations?.decisions ?? [])
              .filter((decision) => decision.decisionType === "SUPERVISOR_REVIEW" || decision.decisionType === "FINAL_APPROVAL")
              .slice(0, 6)
              .map((decision) => (
                <div className="rounded-2xl border p-4" key={decision.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{decision.decisionType.replaceAll("_", " ")}</p>
                    <Badge variant={decision.approved ? "default" : "outline"}>{decision.approved ? "APPROVED" : "REVIEW"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{decision.reasoning}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
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

import type {
  AgentAvailabilityDto,
  AgentSkillDto,
  HumanAgentDto,
  QueueDto,
  QueueHealthDto,
  QueueSessionDto,
  RoutingDecisionDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function QueueDashboardPanel({
  health,
  queues,
}: Readonly<{ health: QueueHealthDto[]; queues: QueueDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue dashboard</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {queues.map((queue) => {
          const current = health.find((item) => item.queueId === queue.id);
          return (
            <div className="rounded-2xl border p-4" key={queue.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{queue.name}</p>
                <Badge variant={queue.active ? "default" : "outline"}>{queue.active ? "ACTIVE" : "INACTIVE"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Waiting" value={current?.waiting ?? 0} />
                <Metric label="Assigned" value={current?.assigned ?? 0} />
                <Metric label="Avg wait" value={`${Math.round(current?.averageWaitTime ?? 0)}s`} />
                <Metric label="Agents" value={current?.activeAgents ?? 0} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Priority {queue.priority} / overflow {queue.overflowQueueId ? queue.overflowQueueId.slice(-8) : "none"}
              </p>
            </div>
          );
        })}
        {!queues.length ? <p className="text-sm text-muted-foreground">No queues configured yet.</p> : null}
      </CardContent>
    </Card>
  );
}

export function AgentWorkloadPanel({
  agents,
  availability,
  skills,
}: Readonly<{ agents: HumanAgentDto[]; availability: AgentAvailabilityDto[]; skills: AgentSkillDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent workload</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Workload</TableHead>
              <TableHead>Skills</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => {
              const current = availability.find((item) => item.agentId === agent.id);
              const agentSkills = skills.filter((item) => item.agentId === agent.id && item.active);
              return (
                <TableRow key={agent.id}>
                  <TableCell>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.status === "AVAILABLE" ? "default" : "outline"}>{agent.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {current?.activeSessionCount ?? 0}/{current?.capacity ?? 1}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {agentSkills.length
                      ? agentSkills.map((skill) => `${skill.skill} L${skill.level}${skill.certified ? " certified" : ""}`).join(", ")
                      : agent.skills.join(", ") || "No skills assigned"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function RoutingDecisionPanel({ decisions }: Readonly<{ decisions: RoutingDecisionDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing decisions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.slice(0, 8).map((decision) => (
          <div className="rounded-2xl border p-4" key={decision.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{decision.reason}</p>
              <Badge variant={decision.status === "COMPLETED" ? "default" : "destructive"}>
                {Math.round(decision.confidence * 100)}%
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Queue {decision.queueId?.slice(-8) ?? "none"} / agent {decision.agentId?.slice(-8) ?? "waiting"} /{" "}
              {new Date(decision.createdAt).toLocaleTimeString()}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{decision.decisionPath.join(" -> ")}</p>
          </div>
        ))}
        {!decisions.length ? <p className="text-sm text-muted-foreground">Routing decisions will appear after assignment requests.</p> : null}
      </CardContent>
    </Card>
  );
}

export function EscalationTimelinePanel({
  queues,
  sessions,
}: Readonly<{ queues: QueueDto[]; sessions: QueueSessionDto[] }>) {
  const escalated = sessions.filter((session) => session.escalationPath.length || session.status === "TRANSFERRED");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escalation timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {escalated.slice(0, 8).map((session) => (
          <div className="rounded-2xl border p-4" key={session.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Session {session.id.slice(-8)}</p>
              <Badge variant="outline">{session.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{session.routingReason ?? "Escalation route recorded"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {session.escalationPath.map((queueId) => queues.find((queue) => queue.id === queueId)?.name ?? queueId.slice(-8)).join(" -> ") ||
                "Supervisor escalation"}
            </p>
          </div>
        ))}
        {!escalated.length ? <p className="text-sm text-muted-foreground">No escalations recorded yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

import type { ActionAuditDto, ScheduledFollowupDto, WorkflowActionDto, WorkflowExecutionDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function WorkflowExecutionsPanel({ workflows }: Readonly<{ workflows: WorkflowExecutionDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow executions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Reasoning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.slice(0, 8).map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className="font-mono text-xs">{workflow.id.slice(-10)}</TableCell>
                <TableCell><Badge>{workflow.status}</Badge></TableCell>
                <TableCell>{workflow.completedActions}/{workflow.plannedActions.length}</TableCell>
                <TableCell className="max-w-md truncate">{workflow.reasoning}</TableCell>
              </TableRow>
            ))}
            {!workflows.length ? <EmptyRow colSpan={4} text="No workflow executions yet." /> : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ActionHistoryPanel({ actions }: Readonly<{ actions: WorkflowActionDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.slice(0, 10).map((action) => (
          <div className="rounded-2xl border p-4" key={action.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{action.actionType}</p>
              <Badge variant={action.status === "SUCCEEDED" ? "default" : action.status === "FAILED" ? "destructive" : "outline"}>
                {action.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {action.toolName} · {Math.round(action.confidence * 100)}% · {new Date(action.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{action.reasoning}</p>
          </div>
        ))}
        {!actions.length ? <p className="text-sm text-muted-foreground">No AI actions have been executed yet.</p> : null}
      </CardContent>
    </Card>
  );
}

export function FollowupQueuePanel({ followups }: Readonly<{ followups: ScheduledFollowupDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {followups.slice(0, 8).map((followup) => (
          <div className="rounded-2xl border p-4" key={followup.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">Lead {followup.leadId.slice(-8)}</p>
              <Badge variant="outline">{followup.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {followup.priority} · {new Date(followup.followupDate).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{followup.reason}</p>
          </div>
        ))}
        {!followups.length ? <p className="text-sm text-muted-foreground">No scheduled follow-ups yet.</p> : null}
      </CardContent>
    </Card>
  );
}

export function HandoffEventsPanel({ audits }: Readonly<{ audits: ActionAuditDto[] }>) {
  const handoffs = audits.filter((audit) => audit.actionType === "TRIGGER_HANDOFF");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Handoff events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {handoffs.slice(0, 6).map((audit) => (
          <div className="rounded-2xl border p-4" key={audit.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{audit.toolName}</p>
              <Badge>{audit.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{audit.reasoning}</p>
          </div>
        ))}
        {!handoffs.length ? <p className="text-sm text-muted-foreground">No handoff action audits yet.</p> : null}
      </CardContent>
    </Card>
  );
}

export function AuditTrailPanel({ audits }: Readonly<{ audits: ActionAuditDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {audits.slice(0, 10).map((audit) => (
          <div className="rounded-2xl border p-4" key={audit.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{audit.actionType}</p>
              <Badge variant={audit.status === "SUCCESS" ? "default" : audit.status === "FAILED" ? "destructive" : "outline"}>
                {audit.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleString()}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{audit.reasoning}</p>
          </div>
        ))}
        {!audits.length ? <p className="text-sm text-muted-foreground">No action audit records yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function EmptyRow({ colSpan, text }: Readonly<{ colSpan: number; text: string }>) {
  return (
    <TableRow>
      <TableCell className="py-8 text-center text-muted-foreground" colSpan={colSpan}>{text}</TableCell>
    </TableRow>
  );
}

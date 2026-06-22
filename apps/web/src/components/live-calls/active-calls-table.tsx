import Link from "next/link";
import type { ActiveCallSessionDto } from "@voicenexus/contracts";

import type { HumanAgentDto, QueueDto, QueueSessionDto } from "@/lib/api/ai-brain-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallStateBadge } from "./call-state-badge";

export function ActiveCallsTable({
  agents = [],
  calls,
  queueSessions = [],
  queues = [],
}: Readonly<{
  agents?: HumanAgentDto[];
  calls: ActiveCallSessionDto[];
  queueSessions?: QueueSessionDto[];
  queues?: QueueDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active calls</CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="font-medium">No active realtime calls</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Twilio Media Stream sessions will appear here once the realtime gateway receives them.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Call session</TableHead>
                <TableHead>Provider call</TableHead>
                <TableHead>Assigned queue</TableHead>
                <TableHead>Assigned agent</TableHead>
                <TableHead>Routing reason</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => {
                const queueSession = queueSessions.find((session) => session.callId === call.callSessionId);
                const queue = queues.find((item) => item.id === queueSession?.queueId);
                const agent = agents.find((item) => item.id === queueSession?.assignedAgentId);
                const escalationPath = queueSession?.escalationPath
                  .map((queueId) => queues.find((item) => item.id === queueId)?.name ?? queueId.slice(-8))
                  .join(" -> ");

                return (
                  <TableRow key={call.callSessionId}>
                    <TableCell className="font-mono text-xs">{call.callSessionId}</TableCell>
                    <TableCell className="font-mono text-xs">{call.providerCallSid ?? "Pending"}</TableCell>
                    <TableCell>{queue?.name ?? "Unassigned"}</TableCell>
                    <TableCell>{agent?.name ?? "Waiting"}</TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground">
                      {queueSession?.routingReason ?? "No routing decision"}
                      {escalationPath ? <span className="block">Escalation: {escalationPath}</span> : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{call.streamSid ?? "Not started"}</TableCell>
                    <TableCell>
                      <CallStateBadge status={call.status} />
                    </TableCell>
                    <TableCell>{new Date(call.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/calls/${call.callSessionId}`}>Open call</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

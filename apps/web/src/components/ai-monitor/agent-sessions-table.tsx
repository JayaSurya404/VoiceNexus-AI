"use client";

import type { AgentSessionDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AgentSessionsTable({
  onSelect,
  selectedSessionId,
  sessions,
}: Readonly<{
  onSelect: (sessionId: string) => void;
  selectedSessionId: string | null;
  sessions: AgentSessionDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Last transcript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                className={cn("cursor-pointer", selectedSessionId === session.id ? "bg-slate-100" : "hover:bg-slate-50")}
                key={session.id}
                onClick={() => onSelect(session.id)}
              >
                <TableCell>
                  <p className="font-mono text-xs">{session.id.slice(-10)}</p>
                  <p className="text-xs text-muted-foreground">{session.callId ? `Call ${session.callId.slice(-8)}` : "No call"}</p>
                </TableCell>
                <TableCell>
                  <Badge>{session.status}</Badge>
                </TableCell>
                <TableCell>{Math.round(session.confidence * 100)}%</TableCell>
                <TableCell>{session.leadId ? session.leadId.slice(-8) : "Unlinked"}</TableCell>
                <TableCell>{session.lastTranscriptAt ? new Date(session.lastTranscriptAt).toLocaleString() : "Waiting"}</TableCell>
              </TableRow>
            ))}
            {!sessions.length ? (
              <TableRow>
                <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                  No agent runtime sessions yet. They will appear after final transcript events arrive.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

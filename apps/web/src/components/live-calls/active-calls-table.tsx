import Link from "next/link";
import type { ActiveCallSessionDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallStateBadge } from "./call-state-badge";

export function ActiveCallsTable({ calls }: Readonly<{ calls: ActiveCallSessionDto[] }>) {
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
                <TableHead>Stream</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.callSessionId}>
                  <TableCell className="font-mono text-xs">{call.callSessionId}</TableCell>
                  <TableCell className="font-mono text-xs">{call.providerCallSid ?? "Pending"}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

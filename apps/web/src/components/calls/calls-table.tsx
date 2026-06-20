"use client";

import Link from "next/link";
import type { CallSessionDto } from "@voicenexus/contracts";

import { CallStatusBadge } from "@/components/calls/call-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CallsTable({ calls }: Readonly<{ calls: CallSessionDto[] }>) {
  return (
    <div className="rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Direction</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.direction}</TableCell>
              <TableCell className="font-mono text-xs">{call.from}</TableCell>
              <TableCell className="font-mono text-xs">{call.to}</TableCell>
              <TableCell>
                <CallStatusBadge status={call.status} />
              </TableCell>
              <TableCell>{call.durationSeconds === null ? "—" : `${call.durationSeconds}s`}</TableCell>
              <TableCell>{new Date(call.createdAt).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/calls/${call.id}`}>Open</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {calls.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center text-sm text-muted-foreground" colSpan={7}>
                No calls have been logged for this organization yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

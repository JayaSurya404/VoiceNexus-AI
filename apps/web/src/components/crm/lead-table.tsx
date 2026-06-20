"use client";

import Link from "next/link";

import type { LeadDto } from "@voicenexus/contracts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./status-badge";

export function LeadTable({ leads }: Readonly<{ leads: LeadDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Link className="font-medium hover:underline" href={`/crm/leads/${lead.id}`}>
                    {lead.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{lead.email ?? lead.phone ?? "No contact yet"}</p>
                </TableCell>
                <TableCell>{lead.company || "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell>{lead.score}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.length > 0 ? (
                      lead.tags.map((tag) => (
                        <Badge key={tag.id} style={{ borderColor: tag.color, color: tag.color }} variant="outline">
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.lastActivityAt ? new Date(lead.lastActivityAt).toLocaleDateString() : "No activity"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import type { CallSessionDto } from "@voicenexus/contracts";

import { CallStatusBadge } from "@/components/calls/call-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CallSummaryCard({ call }: Readonly<{ call: CallSessionDto }>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Call session</CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{call.providerCallSid ?? call.id}</p>
          </div>
          <CallStatusBadge status={call.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="Direction" value={call.direction} />
        <Detail label="Provider" value={call.provider} />
        <Detail label="From" value={call.from} />
        <Detail label="To" value={call.to} />
        <Detail label="Started" value={call.startedAt ? new Date(call.startedAt).toLocaleString() : "Pending"} />
        <Detail label="Ended" value={call.endedAt ? new Date(call.endedAt).toLocaleString() : "Pending"} />
        <Detail label="Duration" value={call.durationSeconds === null ? "Pending" : `${call.durationSeconds}s`} />
        <Detail label="Recording" value={call.recordingEnabled ? "Enabled" : "Disabled"} />
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

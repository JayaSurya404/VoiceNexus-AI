import type { CallSessionDto } from "@voicenexus/contracts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CallMetrics({ calls }: Readonly<{ calls: CallSessionDto[] }>) {
  const totalCalls = calls.length;
  const inboundCalls = calls.filter((call) => call.direction === "INBOUND").length;
  const outboundCalls = calls.filter((call) => call.direction === "OUTBOUND").length;
  const completedCalls = calls.filter((call) => call.status === "COMPLETED").length;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <MetricCard label="Total calls" value={totalCalls} />
      <MetricCard label="Inbound" value={inboundCalls} />
      <MetricCard label="Outbound" value={outboundCalls} />
      <MetricCard label="Completed" value={completedCalls} />
    </section>
  );
}

function MetricCard({ label, value }: Readonly<{ label: string; value: number }>) {
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

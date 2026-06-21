import type { RuntimeMetricsDto } from "@/lib/api/ai-brain-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RuntimeMetrics({ metrics }: Readonly<{ metrics: RuntimeMetricsDto | undefined }>) {
  const values = [
    ["Active sessions", metrics?.activeSessions ?? 0],
    ["Completed", metrics?.completedSessions ?? 0],
    ["Human handoffs", metrics?.handoffDecisions ?? 0],
    ["Avg confidence", `${Math.round((metrics?.averageConfidence ?? 0) * 100)}%`],
    ["Hot leads", metrics?.hotLeads ?? 0],
    ["Action success", `${Math.round((metrics?.actionSuccessRate ?? 0) * 100)}%`],
    ["Pending follow-ups", metrics?.pendingFollowups ?? 0],
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
      {values.map(([label, value]) => (
        <Card key={String(label)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

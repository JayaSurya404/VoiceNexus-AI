import { Trophy, UserCheck, UserPlus, UsersRound } from "lucide-react";

import type { LeadDto } from "@voicenexus/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metricDefinitions = [
  { label: "Total Leads", key: "total", icon: UsersRound, tone: "text-slate-700" },
  { label: "New Leads", key: "new", icon: UserPlus, tone: "text-sky-600" },
  { label: "Qualified Leads", key: "qualified", icon: UserCheck, tone: "text-emerald-600" },
  { label: "Won Leads", key: "won", icon: Trophy, tone: "text-amber-600" },
] as const;

export function CrmMetrics({ leads }: Readonly<{ leads: LeadDto[] }>) {
  const values = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "NEW").length,
    qualified: leads.filter((lead) => lead.status === "QUALIFIED").length,
    won: leads.filter((lead) => lead.status === "WON").length,
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metricDefinitions.map((metric) => (
        <Card key={metric.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.tone}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{values[metric.key]}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

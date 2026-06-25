"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentDashboard, useAgentPerformance } from "@/hooks/use-agents";
import { useAuthStore } from "@/store/auth-store";

export default function AgentAnalyticsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const dashboard = useAgentDashboard(organizationId);
  const performance = useAgentPerformance(organizationId);
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before viewing agent analytics." />;
  const calls = (performance.data ?? []).reduce((sum, item) => sum + item.callsHandled, 0);
  const conversions = (performance.data ?? []).reduce((sum, item) => sum + item.conversions, 0);

  return <div className="space-y-6"><section className="grid gap-4 md:grid-cols-4"><Metric label="Agents" value={dashboard.data?.totalAgents ?? 0} /><Metric label="Active" value={dashboard.data?.activeAgents ?? 0} /><Metric label="Calls handled" value={calls} /><Metric label="Conversions" value={conversions} /></section><Card><CardHeader><CardTitle>Agent analytics</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">{(performance.data ?? []).map((item) => <div className="rounded-2xl border p-4" key={item.id}><p className="font-medium">Agent {item.agentId.slice(-8)}</p><p className="mt-2 text-sm text-muted-foreground">QA {item.averageQaScore} · Transfer {item.transfers} · Lead quality {item.leadQuality}</p></div>)}</CardContent></Card></div>;
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></CardContent></Card>;
}

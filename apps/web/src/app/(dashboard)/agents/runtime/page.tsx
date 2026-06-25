"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents, useAgentAvailability } from "@/hooks/use-agents";
import { useAuthStore } from "@/store/auth-store";

export default function AgentRuntimePage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const availability = useAgentAvailability(organizationId);
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before viewing runtime status." />;
  const availabilityByAgent = new Map((availability.data ?? []).map((item) => [item.agentId, item]));

  return <Card><CardHeader><CardTitle>Runtime Status</CardTitle></CardHeader><CardContent className="space-y-3">{agents.isLoading ? <Skeleton className="h-24" /> : null}{(agents.data ?? []).map((agent) => {
    const currentAvailability = availabilityByAgent.get(agent.id);
    return <div className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]" key={agent.id}><div><p className="font-medium">{agent.name}</p><p className="text-sm text-muted-foreground">Session {agent.activeSessionId ?? "none"} · Capacity {currentAvailability?.capacity ?? 1}</p></div><div className="flex flex-wrap gap-2"><Badge>{agent.status}</Badge><Badge variant="outline">{agent.runtimeStatus}</Badge></div></div>;
  })}</CardContent></Card>;
}

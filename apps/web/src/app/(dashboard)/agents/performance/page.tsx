"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgentPerformance, useAgents } from "@/hooks/use-agents";
import { useAuthStore } from "@/store/auth-store";

export default function AgentPerformancePage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const performance = useAgentPerformance(organizationId);
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before viewing agent performance." />;
  const agentById = new Map((agents.data ?? []).map((agent) => [agent.id, agent.name]));

  return (
    <Card>
      <CardHeader><CardTitle>Agent Performance Dashboard</CardTitle></CardHeader>
      <CardContent>
        {performance.isLoading ? <Skeleton className="h-32" /> : null}
        <Table><TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Calls</TableHead><TableHead>QA</TableHead><TableHead>Sentiment</TableHead><TableHead>Conversions</TableHead><TableHead>Lead quality</TableHead></TableRow></TableHeader><TableBody>
          {(performance.data ?? []).map((item) => <TableRow key={item.id}><TableCell>{agentById.get(item.agentId) ?? item.agentId.slice(-8)}</TableCell><TableCell>{item.callsHandled}</TableCell><TableCell>{item.averageQaScore}</TableCell><TableCell>{item.averageSentiment}</TableCell><TableCell>{item.conversions}</TableCell><TableCell>{item.leadQuality}</TableCell></TableRow>)}
        </TableBody></Table>
      </CardContent>
    </Card>
  );
}

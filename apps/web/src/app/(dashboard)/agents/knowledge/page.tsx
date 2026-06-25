"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgents, useUpdateAgent } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentKnowledgePage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const updateAgent = useUpdateAgent();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before assigning knowledge." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateAgent.mutate({
      id: formString(formData, "agentId"),
      input: {
        organizationId: activeOrganizationId,
        knowledgeBaseIds: formString(formData, "knowledgeBaseIds").split(",").map((item) => item.trim()).filter(Boolean),
      },
    });
  }

  return <Card><CardHeader><CardTitle>Knowledge Assignment</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}>
    <div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{(agents.data ?? []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="knowledgeBaseIds">Knowledge base ids</Label><Input id="knowledgeBaseIds" name="knowledgeBaseIds" placeholder="Comma-separated knowledge base ids" /></div>
    <Button disabled={updateAgent.isPending} type="submit">Assign knowledge</Button>
  </form></CardContent></Card>;
}

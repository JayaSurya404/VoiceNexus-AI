"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgents, useUpdateAgent } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentPromptsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const updateAgent = useUpdateAgent();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before editing prompts." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateAgent.mutate({ id: formString(formData, "agentId"), input: { organizationId: activeOrganizationId, prompt: formString(formData, "prompt") } });
  }

  return <ConfigPage title="Prompt Editor" field="prompt" label="Prompt" agents={agents.data ?? []} onSubmit={handleSubmit} pending={updateAgent.isPending} />;
}

function ConfigPage({ title, field, label, agents, onSubmit, pending }: Readonly<{ title: string; field: string; label: string; agents: Array<{ id: string; name: string; prompt: string }>; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; pending: boolean }>) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={onSubmit}><div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div><div className="space-y-2"><Label htmlFor={field}>{label}</Label><Textarea id={field} name={field} required /></div><Button disabled={pending} type="submit">Save prompt</Button></form></CardContent></Card>;
}

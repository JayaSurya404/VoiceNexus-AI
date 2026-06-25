"use client";

import { agentVoiceProviders, type AgentVoiceProvider } from "@voicenexus/contracts";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgents, useUpdateAgent } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentVoicePage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const updateAgent = useUpdateAgent();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before assigning voices." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateAgent.mutate({
      id: formString(formData, "agentId"),
      input: {
        organizationId: activeOrganizationId,
        voiceProvider: formString(formData, "voiceProvider", "NONE") as AgentVoiceProvider,
        voiceId: formString(formData, "voiceId"),
      },
    });
  }

  return (
    <Card><CardHeader><CardTitle>Voice Assignment</CardTitle></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
      <div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{(agents.data ?? []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="voiceProvider">Provider</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="voiceProvider" name="voiceProvider">{agentVoiceProviders.map((provider) => <option key={provider} value={provider}>{provider}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="voiceId">Voice id</Label><Input id="voiceId" name="voiceId" /></div>
      <Button className="md:col-span-3" disabled={updateAgent.isPending} type="submit">Assign voice</Button>
    </form></CardContent></Card>
  );
}

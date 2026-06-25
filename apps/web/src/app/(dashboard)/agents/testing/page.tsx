"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgents, useTestAgent } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentTestingPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const testAgent = useTestAgent();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before testing agents." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    testAgent.mutate({
      organizationId: activeOrganizationId,
      agentId: formString(formData, "agentId"),
      message: formString(formData, "message"),
      crmContext: formString(formData, "crmContext"),
      memoryContext: formString(formData, "memoryContext"),
    });
  }

  return <div className="grid gap-6 xl:grid-cols-2"><Card><CardHeader><CardTitle>Agent Testing Page</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}>
    <div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{(agents.data ?? []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
    <Area label="Customer message" name="message" required /><Area label="CRM context" name="crmContext" /><Area label="Memory context" name="memoryContext" />
    <Button disabled={testAgent.isPending} type="submit">Run test</Button>
  </form></CardContent></Card><Card><CardHeader><CardTitle>Result</CardTitle></CardHeader><CardContent>{testAgent.data ? <div className="space-y-3"><p className="text-sm text-muted-foreground">Confidence {Math.round(testAgent.data.confidence * 100)}% · {testAgent.data.runtimeStatus}</p><pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{testAgent.data.response}</pre></div> : <p className="text-sm text-muted-foreground">Run a test to see the generated response.</p>}</CardContent></Card></div>;
}

function Area({ label, name, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} {...props} /></div>;
}

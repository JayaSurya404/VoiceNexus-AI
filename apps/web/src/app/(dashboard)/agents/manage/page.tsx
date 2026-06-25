"use client";

import Link from "next/link";
import { agentRoles, agentVoiceProviders, type AgentRole, type AgentVoiceProvider } from "@voicenexus/contracts";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgents, useCreateAgent, useAgentPersonas } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentsManagePage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));
  const personas = useAgentPersonas(activeOrganizationId);
  const createAgent = useCreateAgent();

  if (!activeOrganizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before creating agents." />;
  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createAgent.mutate({
      organizationId,
      name: formString(formData, "name"),
      email: formString(formData, "email"),
      role: formString(formData, "role", "AGENT") as AgentRole,
      skills: formString(formData, "skills").split(",").map((item) => item.trim()).filter(Boolean),
      personaId: formString(formData, "personaId") || null,
      voiceProvider: formString(formData, "voiceProvider", "NONE") as AgentVoiceProvider,
      voiceId: formString(formData, "voiceId"),
      knowledgeBaseIds: formString(formData, "knowledgeBaseIds").split(",").map((item) => item.trim()).filter(Boolean),
      prompt: formString(formData, "prompt"),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader><CardTitle>Create agent</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Name" name="name" required /><Field label="Email" name="email" type="email" required />
            <Select label="Role" name="role" options={agentRoles} /><Select label="Voice provider" name="voiceProvider" options={agentVoiceProviders} />
            <Field label="Voice id" name="voiceId" /><Field label="Skills" name="skills" placeholder="SALES, SUPPORT" />
            <div className="space-y-2"><Label htmlFor="personaId">Persona</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="personaId" name="personaId"><option value="">No persona</option>{(personas.data ?? []).map((persona) => <option key={persona.id} value={persona.id}>{persona.name}</option>)}</select></div>
            <Field label="Knowledge base ids" name="knowledgeBaseIds" />
            <div className="space-y-2"><Label htmlFor="prompt">Prompt override</Label><Textarea id="prompt" name="prompt" /></div>
            <Button className="w-full" disabled={createAgent.isPending} type="submit">Create agent</Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {(agents.data ?? []).map((agent) => (
          <Card key={agent.id}>
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div><p className="font-medium">{agent.name}</p><p className="text-sm text-muted-foreground">{agent.email} · {agent.role}</p></div>
              <div className="flex flex-wrap gap-2"><Badge>{agent.status}</Badge><Badge variant="outline">{agent.runtimeStatus}</Badge><Button asChild size="sm" variant="outline"><Link href={`/agents/manage/${agent.id}`}>Configure</Link></Button></div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, options }: Readonly<{ label: string; name: string; options: readonly string[] }>) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id={name} name={name}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

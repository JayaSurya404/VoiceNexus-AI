"use client";

import { useParams } from "next/navigation";
import { agentRoles, agentRuntimeStatuses, agentStatuses, agentVoiceProviders, type AgentRole, type AgentRuntimeStatus, type AgentStatus, type AgentVoiceProvider } from "@voicenexus/contracts";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAgentDetails, useAgentPersonas, useUpdateAgent } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentConfigurePage() {
  const params = useParams<{ id: string }>();
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const details = useAgentDetails(organizationId, params.id);
  const personas = useAgentPersonas(organizationId);
  const updateAgent = useUpdateAgent();

  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before configuring agents." />;
  const activeOrganizationId = organizationId;
  if (details.isLoading) return <Skeleton className="h-96" />;
  if (!details.data) return <AgentEmptyState title="Agent unavailable" description="This agent could not be loaded." />;

  const agent = details.data.agent;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateAgent.mutate({
      id: params.id,
      input: {
        organizationId: activeOrganizationId,
        name: formString(formData, "name"),
        email: formString(formData, "email"),
        role: formString(formData, "role", agent.role) as AgentRole,
        status: formString(formData, "status", agent.status) as AgentStatus,
        runtimeStatus: formString(formData, "runtimeStatus", agent.runtimeStatus) as AgentRuntimeStatus,
        personaId: formString(formData, "personaId") || null,
        voiceProvider: formString(formData, "voiceProvider", agent.voice.provider) as AgentVoiceProvider,
        voiceId: formString(formData, "voiceId"),
        skills: formString(formData, "skills").split(",").map((item) => item.trim()).filter(Boolean),
        knowledgeBaseIds: formString(formData, "knowledgeBaseIds").split(",").map((item) => item.trim()).filter(Boolean),
        prompt: formString(formData, "prompt"),
      },
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader><CardTitle>Agent configuration</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field defaultValue={agent.name} label="Name" name="name" required />
            <Field defaultValue={agent.email} label="Email" name="email" type="email" required />
            <Select defaultValue={agent.role} label="Role" name="role" options={agentRoles} />
            <Select defaultValue={agent.status} label="Availability status" name="status" options={agentStatuses} />
            <Select defaultValue={agent.runtimeStatus} label="Runtime status" name="runtimeStatus" options={agentRuntimeStatuses} />
            <Select defaultValue={agent.voice.provider} label="Voice provider" name="voiceProvider" options={agentVoiceProviders} />
            <Field defaultValue={agent.voice.voiceId} label="Voice id" name="voiceId" />
            <Field defaultValue={agent.skills.join(", ")} label="Skills" name="skills" />
            <Field defaultValue={agent.knowledgeBaseIds.join(", ")} label="Knowledge base ids" name="knowledgeBaseIds" />
            <div className="space-y-2"><Label htmlFor="personaId">Persona</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" defaultValue={agent.personaId ?? ""} id="personaId" name="personaId"><option value="">No persona</option>{(personas.data ?? []).map((persona) => <option key={persona.id} value={persona.id}>{persona.name}</option>)}</select></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="prompt">Prompt override</Label><Textarea defaultValue={agent.prompt} id="prompt" name="prompt" /></div>
            <Button className="md:col-span-2" disabled={updateAgent.isPending} type="submit">Save configuration</Button>
          </form>
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <Card><CardHeader><CardTitle className="text-lg">Persona</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{details.data.persona?.name ?? "No persona assigned"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Availability</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{details.data.availability ? `${details.data.availability.status} · capacity ${details.data.availability.capacity}` : "No schedule configured"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Performance</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{details.data.performance ? `QA ${details.data.performance.averageQaScore} · ${details.data.performance.callsHandled} calls` : "No performance data yet"}</CardContent></Card>
      </aside>
    </div>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, options, defaultValue }: Readonly<{ label: string; name: string; options: readonly string[]; defaultValue: string }>) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" defaultValue={defaultValue} id={name} name={name}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

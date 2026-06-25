"use client";

import { agentPersonaRoles, type AgentPersonaRole } from "@voicenexus/contracts";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgentPersonas, useCreateAgentPersona } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentPersonasPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const personas = useAgentPersonas(organizationId);
  const createPersona = useCreateAgentPersona();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before creating personas." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createPersona.mutate({
      organizationId: activeOrganizationId,
      name: formString(formData, "name"),
      role: formString(formData, "role", "SALES_AGENT") as AgentPersonaRole,
      tone: formString(formData, "tone", "Clear, warm, and concise"),
      systemPrompt: formString(formData, "systemPrompt"),
      goals: formString(formData, "goals").split("\n").map((item) => item.trim()).filter(Boolean),
      constraints: formString(formData, "constraints").split("\n").map((item) => item.trim()).filter(Boolean),
      isDefault: formData.get("isDefault") === "on",
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card><CardHeader><CardTitle>Create persona</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name" name="name" required />
        <div className="space-y-2"><Label htmlFor="role">Role</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="role" name="role">{agentPersonaRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
        <Field label="Tone" name="tone" />
        <Area label="System prompt" name="systemPrompt" required />
        <Area label="Goals" name="goals" placeholder="One goal per line" />
        <Area label="Constraints" name="constraints" placeholder="One constraint per line" />
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input name="isDefault" type="checkbox" /> Default persona</label>
        <Button className="w-full" disabled={createPersona.isPending} type="submit">Create persona</Button>
      </form></CardContent></Card>
      <section className="space-y-4">{(personas.data ?? []).map((persona) => <Card key={persona.id}><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">{persona.name}</CardTitle>{persona.isDefault ? <Badge>Default</Badge> : null}</div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{persona.role} · {persona.tone}</p><p className="mt-3 text-sm leading-6">{persona.systemPrompt}</p></CardContent></Card>)}</section>
    </div>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}
function Area({ label, name, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} {...props} /></div>;
}

"use client";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgents, useAgentSkills, useCreateAgentSkill } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentSkillsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const skills = useAgentSkills(organizationId);
  const createSkill = useCreateAgentSkill();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before managing skills." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createSkill.mutate({
      organizationId: activeOrganizationId,
      agentId: formString(formData, "agentId"),
      skill: formString(formData, "skill"),
      level: Number(formString(formData, "level", "3")),
      certified: formData.get("certified") === "on",
      active: true,
    });
    event.currentTarget.reset();
  }

  return <div className="grid gap-6 xl:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Add skill</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}>
    <div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{(agents.data ?? []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
    <Field label="Skill" name="skill" required /><Field defaultValue="3" label="Level" max={5} min={1} name="level" type="number" />
    <label className="flex items-center gap-2 text-sm text-muted-foreground"><input name="certified" type="checkbox" /> Certified</label>
    <Button className="w-full" disabled={createSkill.isPending} type="submit">Save skill</Button>
  </form></CardContent></Card><section className="grid gap-4 md:grid-cols-2">{(skills.data ?? []).map((skill) => <Card key={skill.id}><CardContent className="p-5"><div className="flex items-center justify-between"><p className="font-medium">{skill.skill}</p><Badge>{skill.active ? "Active" : "Inactive"}</Badge></div><p className="mt-2 text-sm text-muted-foreground">Level {skill.level} · {skill.certified ? "Certified" : "Not certified"}</p></CardContent></Card>)}</section></div>;
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

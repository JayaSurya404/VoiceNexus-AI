"use client";

import { agentStatuses, type AgentStatus } from "@voicenexus/contracts";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgents, useAgentAvailability, useUpsertAgentAvailability } from "@/hooks/use-agents";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function AgentSchedulingPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));
  const availability = useAgentAvailability(organizationId);
  const upsertAvailability = useUpsertAgentAvailability();
  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before scheduling agents." />;
  const activeOrganizationId = organizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    upsertAvailability.mutate({
      organizationId: activeOrganizationId,
      agentId: formString(formData, "agentId"),
      status: formString(formData, "status", "AVAILABLE") as AgentStatus,
      statusReason: formString(formData, "statusReason") || null,
      capacity: Number(formString(formData, "capacity", "1")),
      schedule: [{
        dayOfWeek: Number(formString(formData, "dayOfWeek", "1")),
        startTime: formString(formData, "startTime", "09:00"),
        endTime: formString(formData, "endTime", "17:00"),
        timezone: formString(formData, "timezone", "UTC"),
        active: true,
      }],
    });
  }

  return <div className="grid gap-6 xl:grid-cols-[420px_1fr]"><Card><CardHeader><CardTitle>Availability Scheduling</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}>
    <div className="space-y-2"><Label htmlFor="agentId">Agent</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="agentId" name="agentId">{(agents.data ?? []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="status">Status</Label><select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="status" name="status">{agentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
    <Field defaultValue="1" label="Capacity" min={1} name="capacity" type="number" /><Field defaultValue="1" label="Day of week" max={6} min={0} name="dayOfWeek" type="number" /><Field defaultValue="09:00" label="Start" name="startTime" /><Field defaultValue="17:00" label="End" name="endTime" /><Field defaultValue="UTC" label="Timezone" name="timezone" /><Field label="Reason" name="statusReason" />
    <Button className="w-full" disabled={upsertAvailability.isPending} type="submit">Save schedule</Button>
  </form></CardContent></Card><section className="space-y-4">{(availability.data ?? []).map((item) => <Card key={item.id}><CardContent className="p-5"><div className="flex items-center justify-between"><p className="font-medium">Agent {item.agentId.slice(-8)}</p><Badge>{item.status}</Badge></div><p className="mt-2 text-sm text-muted-foreground">Capacity {item.capacity} · {item.schedule.length} schedule blocks</p></CardContent></Card>)}</section></div>;
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

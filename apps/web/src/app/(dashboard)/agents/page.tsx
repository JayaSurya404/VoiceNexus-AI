"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Brain, CalendarDays, FlaskConical, Mic, PencilLine, Settings2, UserPlus, Wrench } from "lucide-react";

import { AgentEmptyState } from "@/components/agents/agent-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentDashboard, useAgents } from "@/hooks/use-agents";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { label: "Manage Agents", href: "/agents/manage", icon: UserPlus },
  { label: "Personas", href: "/agents/personas", icon: Bot },
  { label: "Prompt Editor", href: "/agents/prompts", icon: PencilLine },
  { label: "Voice Assignment", href: "/agents/voice", icon: Mic },
  { label: "Knowledge", href: "/agents/knowledge", icon: Brain },
  { label: "Skills", href: "/agents/skills", icon: Wrench },
  { label: "Scheduling", href: "/agents/scheduling", icon: CalendarDays },
  { label: "Testing", href: "/agents/testing", icon: FlaskConical },
  { label: "Runtime", href: "/agents/runtime", icon: Settings2 },
  { label: "Performance", href: "/agents/performance", icon: BarChart3 },
  { label: "Analytics", href: "/agents/analytics", icon: BarChart3 },
];

export default function AgentsDashboardPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const dashboard = useAgentDashboard(organizationId);
  const agents = useAgents({ organizationId: organizationId ?? "" }, Boolean(organizationId));

  if (!organizationId) return <AgentEmptyState title="No organization selected" description="Select an organization before managing agents." />;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-indigo-300">Multi-Agent Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agent operations center</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Configure AI personas, prompts, skills, voice, knowledge, schedules, runtime status, testing, and performance.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {["totalAgents", "availableAgents", "activeAgents", "personas", "skills", "averageQaScore"].map((key) => (
          <Card key={key}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label(key)}</p>{dashboard.isLoading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold">{dashboard.data?.[key as keyof typeof dashboard.data] ?? 0}</p>}</CardContent></Card>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {links.map((item) => (
          <Card key={item.href}>
            <CardHeader><item.icon className="h-5 w-5 text-indigo-600" /><CardTitle className="text-lg">{item.label}</CardTitle></CardHeader>
            <CardContent><Button asChild className="w-full" variant="outline"><Link href={item.href}>Open <ArrowRight className="h-4 w-4" /></Link></Button></CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader><CardTitle>Runtime status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {agents.isLoading ? <Skeleton className="h-24" /> : null}
          {(agents.data ?? []).slice(0, 6).map((agent) => (
            <Link className="flex items-center justify-between rounded-2xl border p-4 hover:bg-slate-50" href={`/agents/manage/${agent.id}`} key={agent.id}>
              <div><p className="font-medium">{agent.name}</p><p className="text-sm text-muted-foreground">{agent.email}</p></div>
              <div className="flex gap-2"><Badge>{agent.status}</Badge><Badge variant="outline">{agent.runtimeStatus}</Badge></div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function label(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

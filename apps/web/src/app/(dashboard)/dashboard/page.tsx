"use client";

import { Activity, Bot, Building2, MessageCircle, PhoneCall, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

const stats = [
  { label: "AI call agents", value: "0", icon: Bot, tone: "text-violet-600" },
  { label: "Organizations", value: "Live", icon: Building2, tone: "text-sky-600" },
  { label: "Human agents", value: "1+", icon: Users, tone: "text-emerald-600" },
  { label: "Channels", value: "2 planned", icon: MessageCircle, tone: "text-amber-600" },
];

const nextMilestones = [
  "Connect Twilio voice and webhook signing",
  "Create lead and customer memory collections",
  "Add WhatsApp sender onboarding",
  "Build AI call orchestration workers",
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const organizations = useAuthStore((state) => state.organizations);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
        <Badge className="mb-5 bg-sky-500 text-white hover:bg-sky-500">SaaS foundation ready</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{user ? `, ${user.firstName}` : ""}.
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Your Phase 1 workspace foundation is active: authentication, organization tenancy,
          role-aware navigation, and MongoDB-backed APIs are wired for the communication platform
          that comes next.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations.map((organization) => (
              <div
                className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3"
                key={organization.id}
              >
                <div>
                  <p className="font-medium">{organization.name}</p>
                  <p className="text-sm text-muted-foreground">{organization.role}</p>
                </div>
                <Badge variant="outline">{organization.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-sky-600" />
              Next build phases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextMilestones.map((milestone) => (
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-3" key={milestone}>
                <Activity className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span className="text-sm text-slate-700">{milestone}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

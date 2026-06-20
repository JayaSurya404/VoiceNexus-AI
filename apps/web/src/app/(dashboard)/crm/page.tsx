"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, ContactRound, History, Tags } from "lucide-react";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { CrmMetrics } from "@/components/crm/crm-metrics";
import { LeadTable } from "@/components/crm/lead-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/hooks/use-crm";
import { useAuthStore } from "@/store/auth-store";

const crmLinks = [
  { label: "Leads", href: "/crm/leads", icon: ClipboardList },
  { label: "Contacts", href: "/crm/contacts", icon: ContactRound },
  { label: "Activities", href: "/crm/activities", icon: History },
  { label: "Tags", href: "/crm/leads", icon: Tags },
];

export default function CrmDashboardPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const leadsQuery = useLeads(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const leads = leadsQuery.data ?? [];

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before managing CRM records."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-8 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-sky-300">CRM Foundation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Customer pipeline command center</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Track leads, contacts, activity, notes, and tags inside the active organization.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/crm/leads">Manage leads</Link>
        </Button>
      </section>

      <CrmMetrics leads={leads} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {crmLinks.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <item.icon className="h-5 w-5 text-sky-600" />
              <CardTitle className="text-lg">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href={item.href}>
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <LeadTable leads={leads.slice(0, 8)} />
    </div>
  );
}

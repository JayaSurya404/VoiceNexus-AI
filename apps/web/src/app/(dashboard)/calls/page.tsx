"use client";

import { callStatuses } from "@voicenexus/contracts";

import { CallMetrics } from "@/components/calls/call-metrics";
import { CallsTable } from "@/components/calls/calls-table";
import { OutboundCallForm } from "@/components/calls/outbound-call-form";
import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalls } from "@/hooks/use-calls";
import { useLeads } from "@/hooks/use-crm";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";

export default function CallsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const [status, setStatus] = useState<(typeof callStatuses)[number] | "">("");
  const callsQuery = useCalls(
    { organizationId: activeOrganizationId ?? "", status },
    Boolean(activeOrganizationId),
  );
  const leadsQuery = useLeads({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before managing calls."
        title="No organization selected"
      />
    );
  }

  const calls = callsQuery.data ?? [];
  const leads = leadsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-sky-300">Telephony Infrastructure</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Calls dashboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Place outbound calls, track Twilio lifecycle events, and connect call sessions back to CRM and memory.
        </p>
      </section>

      <CallMetrics calls={calls} />

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 md:w-72">
            <Label htmlFor="call-status-filter">Status filter</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              id="call-status-filter"
              onChange={(event) => setStatus(event.target.value as (typeof callStatuses)[number] | "")}
              value={status}
            >
              <option value="">All statuses</option>
              {callStatuses.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground">Showing organization-scoped call sessions only.</p>
        </CardContent>
      </Card>

      {callsQuery.isLoading ? <Skeleton className="h-72 w-full" /> : <CallsTable calls={calls} />}

      <OutboundCallForm leads={leads} organizationId={activeOrganizationId} />
    </div>
  );
}

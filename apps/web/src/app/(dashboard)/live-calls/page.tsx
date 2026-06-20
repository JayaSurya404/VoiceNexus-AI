"use client";

import { useMemo, useState } from "react";

import { ActiveCallsTable } from "@/components/live-calls/active-calls-table";
import { ConnectionStatusCard } from "@/components/live-calls/connection-status-card";
import { RealtimeEventFeed } from "@/components/live-calls/realtime-event-feed";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveCalls, useLiveCallsSocket } from "@/hooks/use-live-calls";
import { useAuthStore } from "@/store/auth-store";

export default function LiveCallsPage() {
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const organizationId = selectedOrganizationId || activeOrganizationId;
  const activeCallsQuery = useActiveCalls(organizationId);
  const liveSocket = useLiveCallsSocket(organizationId);
  const selectedOrganizationName = useMemo(
    () => organizations.find((organization) => organization.id === organizationId)?.name ?? "Current organization",
    [organizationId, organizations],
  );

  const calls = activeCallsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-sky-300">Realtime Gateway Foundation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Live calls</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Monitor Twilio Media Stream connections, lifecycle events, and transcript-channel readiness without running any AI,
          STT, or TTS logic.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <ConnectionStatusCard activeCallCount={calls.length} status={liveSocket.status} />
        <Card className="lg:col-span-2">
          <CardContent className="space-y-2 py-6">
            <Label htmlFor="organization-filter">Organization filter</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              id="organization-filter"
              onChange={(event) => setSelectedOrganizationId(event.target.value)}
              value={organizationId ?? ""}
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              Viewing realtime state for {selectedOrganizationName}. Data is scoped per organization.
            </p>
          </CardContent>
        </Card>
      </div>

      {activeCallsQuery.isLoading ? <Skeleton className="h-72 w-full" /> : <ActiveCallsTable calls={calls} />}
      <RealtimeEventFeed events={liveSocket.events} />
    </div>
  );
}

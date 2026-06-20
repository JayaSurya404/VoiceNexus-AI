"use client";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { LeadSelector } from "@/components/memory/lead-selector";
import { TimelineEventForm } from "@/components/memory/timeline-event-form";
import { TimelineView } from "@/components/memory/timeline-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/hooks/use-crm";
import { useTimeline } from "@/hooks/use-memory";
import { useAuthStore } from "@/store/auth-store";
import { useMemoryStore } from "@/store/memory-store";

export default function CustomerTimelinePage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const selectedLeadId = useMemoryStore((state) => state.selectedLeadId);
  const setSelectedLeadId = useMemoryStore((state) => state.setSelectedLeadId);
  const leadsQuery = useLeads({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));
  const leads = leadsQuery.data ?? [];
  const selectedLeadBelongsToOrganization = leads.some((lead) => lead.id === selectedLeadId);
  const effectiveLeadId = selectedLeadBelongsToOrganization ? selectedLeadId : leads.at(0)?.id ?? "";
  const timelineQuery = useTimeline(
    { organizationId: activeOrganizationId ?? "", leadId: effectiveLeadId },
    Boolean(activeOrganizationId && effectiveLeadId),
  );

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before viewing customer timelines."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customer timeline</h1>
        <p className="mt-2 text-muted-foreground">
          Track important customer moments that future AI conversations should remember.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadSelector leads={leads} onChange={setSelectedLeadId} selectedLeadId={effectiveLeadId} />
        </CardContent>
      </Card>

      {effectiveLeadId ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          {timelineQuery.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <TimelineView events={timelineQuery.data ?? []} />
          )}
          <TimelineEventForm leadId={effectiveLeadId} organizationId={activeOrganizationId} />
        </div>
      ) : (
        <CrmEmptyState
          description="Create a lead in CRM before adding timeline events."
          title="No CRM lead available"
        />
      )}
    </div>
  );
}

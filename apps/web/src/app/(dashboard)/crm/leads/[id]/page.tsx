"use client";

import { useParams } from "next/navigation";

import { ActivityForm } from "@/components/crm/activity-form";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { LeadForm } from "@/components/crm/lead-form";
import { NotesPanel } from "@/components/crm/notes-panel";
import { StatusBadge } from "@/components/crm/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities, useLead, useNotes, useTags } from "@/hooks/use-crm";
import { useAuthStore } from "@/store/auth-store";

export default function LeadDetailsPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const leadQuery = useLead(activeOrganizationId, leadId);
  const tagsQuery = useTags(activeOrganizationId);
  const activitiesQuery = useActivities(
    { organizationId: activeOrganizationId ?? "", leadId },
    Boolean(activeOrganizationId),
  );
  const notesQuery = useNotes(
    { organizationId: activeOrganizationId ?? "", leadId },
    Boolean(activeOrganizationId),
  );

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select an organization before opening lead records."
        title="No organization selected"
      />
    );
  }

  if (leadQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const lead = leadQuery.data;

  if (!lead) {
    return <CrmEmptyState description="This lead was not found in the active organization." title="Lead not found" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 p-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{lead.fullName}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-2 text-muted-foreground">
              {lead.company || "No company"} · {lead.email ?? lead.phone ?? "No contact channel"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Notes: {lead.notesCount} · Score: {lead.score}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <LeadForm lead={lead} organizationId={activeOrganizationId} tags={tagsQuery.data ?? []} />
          <ActivityTimeline activities={activitiesQuery.data ?? []} />
        </div>
        <div className="space-y-6">
          <ActivityForm leadId={lead.id} organizationId={activeOrganizationId} />
          <NotesPanel leadId={lead.id} notes={notesQuery.data ?? []} organizationId={activeOrganizationId} />
        </div>
      </div>
    </div>
  );
}

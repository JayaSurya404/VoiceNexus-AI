"use client";

import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { useActivities } from "@/hooks/use-crm";
import { useAuthStore } from "@/store/auth-store";

export default function ActivitiesPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const activitiesQuery = useActivities(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select an organization before reviewing activity."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Activities</h1>
        <p className="mt-2 text-muted-foreground">A chronological view of lead activity across the organization.</p>
      </div>
      <ActivityTimeline activities={activitiesQuery.data ?? []} />
    </div>
  );
}

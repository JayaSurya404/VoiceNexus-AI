"use client";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { LeadSelector } from "@/components/memory/lead-selector";
import { PreferenceEditor } from "@/components/memory/preference-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/hooks/use-crm";
import { usePreferences } from "@/hooks/use-memory";
import { useAuthStore } from "@/store/auth-store";
import { useMemoryStore } from "@/store/memory-store";

export default function PreferencesPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const selectedLeadId = useMemoryStore((state) => state.selectedLeadId);
  const setSelectedLeadId = useMemoryStore((state) => state.setSelectedLeadId);
  const leadsQuery = useLeads({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));
  const leads = leadsQuery.data ?? [];
  const selectedLeadBelongsToOrganization = leads.some((lead) => lead.id === selectedLeadId);
  const effectiveLeadId = selectedLeadBelongsToOrganization ? selectedLeadId : leads.at(0)?.id ?? "";
  const preferencesQuery = usePreferences(
    { organizationId: activeOrganizationId ?? "", leadId: effectiveLeadId },
    Boolean(activeOrganizationId && effectiveLeadId),
  );
  const preferences = preferencesQuery.data ?? null;

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before editing customer preferences."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Preferences</h1>
        <p className="mt-2 text-muted-foreground">
          Manage customer communication preferences for AI calling and messaging.
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
        preferencesQuery.isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <PreferenceEditor
            key={`${effectiveLeadId}-${preferences?.updatedAt ?? "new"}`}
            leadId={effectiveLeadId}
            organizationId={activeOrganizationId}
            preferences={preferences}
          />
        )
      ) : (
        <CrmEmptyState
          description="Create a lead in CRM before saving preferences."
          title="No CRM lead available"
        />
      )}
    </div>
  );
}

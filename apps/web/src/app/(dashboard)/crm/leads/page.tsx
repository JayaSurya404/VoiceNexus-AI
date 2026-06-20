"use client";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { LeadFilters } from "@/components/crm/lead-filters";
import { LeadForm } from "@/components/crm/lead-form";
import { LeadTable } from "@/components/crm/lead-table";
import { TagManager } from "@/components/crm/tag-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useTags } from "@/hooks/use-crm";
import { useAuthStore } from "@/store/auth-store";
import { useCrmStore } from "@/store/crm-store";

export default function LeadsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const leadSearch = useCrmStore((state) => state.leadSearch);
  const leadStatus = useCrmStore((state) => state.leadStatus);
  const tagFilter = useCrmStore((state) => state.tagFilter);
  const tagsQuery = useTags(activeOrganizationId);
  const leadsQuery = useLeads(
    {
      organizationId: activeOrganizationId ?? "",
      search: leadSearch,
      status: leadStatus,
      tag: tagFilter,
    },
    Boolean(activeOrganizationId),
  );

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before adding leads."
        title="No organization selected"
      />
    );
  }

  const tags = tagsQuery.data ?? [];
  const leads = leadsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-2 text-muted-foreground">
          Search, filter, assign, and manage organization-scoped leads.
        </p>
      </div>

      <LeadFilters tags={tags} />

      {leadsQuery.isLoading ? <Skeleton className="h-72 w-full" /> : <LeadTable leads={leads} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <LeadForm organizationId={activeOrganizationId} tags={tags} />
        <TagManager organizationId={activeOrganizationId} tags={tags} />
      </div>
    </div>
  );
}

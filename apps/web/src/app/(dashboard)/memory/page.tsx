"use client";

import Link from "next/link";
import { ArrowRight, Clock3, SlidersHorizontal } from "lucide-react";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { ConversationMemoryList } from "@/components/memory/conversation-memory-list";
import { LeadSelector } from "@/components/memory/lead-selector";
import { MemoryCaptureForm } from "@/components/memory/memory-capture-form";
import { MemoryCard } from "@/components/memory/memory-card";
import { MemoryHighlights } from "@/components/memory/memory-highlights";
import { RelationshipScore } from "@/components/memory/relationship-score";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/hooks/use-crm";
import { useCustomerMemories, useMemoryBundle } from "@/hooks/use-memory";
import { useAuthStore } from "@/store/auth-store";
import { useMemoryStore } from "@/store/memory-store";

export default function MemoryCenterPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const selectedLeadId = useMemoryStore((state) => state.selectedLeadId);
  const setSelectedLeadId = useMemoryStore((state) => state.setSelectedLeadId);
  const leadsQuery = useLeads({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));
  const memoriesQuery = useCustomerMemories(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const leads = leadsQuery.data ?? [];
  const selectedLeadBelongsToOrganization = leads.some((lead) => lead.id === selectedLeadId);
  const effectiveLeadId = selectedLeadBelongsToOrganization ? selectedLeadId : leads.at(0)?.id ?? "";
  const memories = memoriesQuery.data ?? [];
  const selectedMemory = memories.find((memory) => memory.leadId === effectiveLeadId);
  const bundleQuery = useMemoryBundle(
    { organizationId: activeOrganizationId ?? "", leadId: effectiveLeadId },
    Boolean(activeOrganizationId && effectiveLeadId && selectedMemory),
  );

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before building customer memory."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-8 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-sky-300">Customer Memory Engine</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Memory center</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Store customer context, conversation facts, relationship health, and AI-ready memory in the active organization.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/memory/timeline">
              Timeline <Clock3 className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/memory/preferences">
              Preferences <SlidersHorizontal className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total memories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{memories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected customer</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSelector leads={leads} onChange={setSelectedLeadId} selectedLeadId={effectiveLeadId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Relationship health</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMemory ? (
              <RelationshipScore score={selectedMemory.relationshipScore} />
            ) : (
              <p className="text-sm text-muted-foreground">Save a memory to start scoring this relationship.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {memoriesQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
            {memories.length === 0 ? (
              <CrmEmptyState
                description="Capture a memory summary or conversation memory for one of your CRM leads."
                title="No customer memories yet"
              />
            ) : null}
          </div>
          <MemoryHighlights memories={memories} />
        </section>
      )}

      {effectiveLeadId ? (
        <MemoryCaptureForm leadId={effectiveLeadId} organizationId={activeOrganizationId} />
      ) : (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Add a CRM lead before capturing memory.
          </CardContent>
        </Card>
      )}

      {bundleQuery.data ? (
        <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
          <ConversationMemoryList memories={bundleQuery.data.conversationMemories} />
          <Card>
            <CardHeader>
              <CardTitle>Next memory actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/memory/timeline">
                  Open timeline <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/memory/preferences">
                  Edit preferences <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";

import { CallEventTimeline } from "@/components/calls/call-event-timeline";
import { CallSummaryCard } from "@/components/calls/call-summary-card";
import { LeadMemoryLinks } from "@/components/calls/lead-memory-links";
import { RecordingSection } from "@/components/calls/recording-section";
import { TransferCallForm } from "@/components/calls/transfer-call-form";
import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallDetails } from "@/hooks/use-calls";
import { useAuthStore } from "@/store/auth-store";

export default function CallDetailsPage() {
  const params = useParams<{ id: string | string[] }>();
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const idParam = params.id;
  const callId = Array.isArray(idParam) ? idParam.at(0) ?? "" : idParam;
  const callQuery = useCallDetails(activeOrganizationId, callId);

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before viewing call details."
        title="No organization selected"
      />
    );
  }

  if (callQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!callQuery.data) {
    return (
      <CrmEmptyState
        description="This call may not exist or may belong to another organization."
        title="Call not found"
      />
    );
  }

  const details = callQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Call details</h1>
        <p className="mt-2 text-muted-foreground">Review telephony state, lifecycle events, recordings, and CRM links.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="space-y-6">
          <CallSummaryCard call={details.call} />
          <CallEventTimeline events={details.events} />
          <RecordingSection recordings={details.recordings} />
        </div>
        <div className="space-y-6">
          <LeadMemoryLinks details={details} />
          <TransferCallForm call={details.call} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

import { AgentSessionsTable } from "@/components/ai-monitor/agent-sessions-table";
import { ConversationFeed } from "@/components/ai-monitor/conversation-feed";
import { DecisionTimeline } from "@/components/ai-monitor/decision-timeline";
import { RuntimeMetrics } from "@/components/ai-monitor/runtime-metrics";
import { StateAndQualification } from "@/components/ai-monitor/state-and-qualification";
import { VoiceResponseMetricsPanel, VoiceResponsesPanel } from "@/components/ai-monitor/voice-response-panels";
import {
  ActionHistoryPanel,
  AuditTrailPanel,
  FollowupQueuePanel,
  HandoffEventsPanel,
  WorkflowExecutionsPanel,
} from "@/components/ai-monitor/workflow-action-panels";
import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAgentDecisions,
  useAgentPersonas,
  useAgentSessions,
  useAiConversations,
  useAiMessages,
  useAiQualifications,
  useAiTools,
  useActionAudits,
  useFollowups,
  useConversationState,
  useRuntimeMetrics,
  useWorkflowActions,
  useWorkflows,
} from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";
import { useVoiceResponseMetrics, useVoiceResponses } from "@/hooks/use-voice-responses";

export default function AiMonitorPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const sessionsQuery = useAgentSessions(activeOrganizationId);
  const conversationsQuery = useAiConversations(activeOrganizationId);
  const qualificationsQuery = useAiQualifications(activeOrganizationId);
  const personasQuery = useAgentPersonas(activeOrganizationId);
  const metricsQuery = useRuntimeMetrics(activeOrganizationId);
  const workflowsQuery = useWorkflows(activeOrganizationId);
  const workflowActionsQuery = useWorkflowActions(activeOrganizationId);
  const followupsQuery = useFollowups(activeOrganizationId);
  const auditsQuery = useActionAudits(activeOrganizationId);
  const voiceResponsesQuery = useVoiceResponses(activeOrganizationId);
  const voiceMetricsQuery = useVoiceResponseMetrics(activeOrganizationId);
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);

  useEffect(() => {
    if (!selectedSessionId && sessions.length) {
      setSelectedSessionId(sessions[0]?.id ?? null);
    }
  }, [selectedSessionId, sessions]);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const selectedConversation = (conversationsQuery.data ?? []).find(
    (conversation) => conversation.id === selectedSession?.aiConversationId,
  );
  const selectedQualification = (qualificationsQuery.data ?? []).find(
    (qualification) => qualification.agentSessionId === selectedSessionId || qualification.leadId === selectedSession?.leadId,
  );
  const stateQuery = useConversationState(selectedSessionId);
  const decisionsQuery = useAgentDecisions(selectedSessionId);
  const messagesQuery = useAiMessages(selectedConversation?.id ?? null);
  const toolsQuery = useAiTools(selectedConversation?.id ?? null);

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select or create an organization before monitoring AI agent runtime sessions."
        title="No organization selected"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-sky-300">AI Agent Runtime · Phase 5.4</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">AI Monitor</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Track transcript-driven agent sessions, restored conversation state, BANT qualification, response decisions,
          and persisted tool calls. Voice synthesis, Realtime API, WhatsApp, email, and campaigns remain out of scope.
        </p>
      </section>

      <RuntimeMetrics metrics={metricsQuery.data} />
      <VoiceResponseMetricsPanel metrics={voiceMetricsQuery.data} />

      <Card>
        <CardHeader>
          <CardTitle>Agent personas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {(personasQuery.data ?? []).map((persona) => (
            <div className="rounded-2xl border p-4" key={persona.id}>
              <p className="font-medium">{persona.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{persona.role.replaceAll("_", " ")}</p>
              <p className="mt-3 text-sm text-muted-foreground">{persona.tone}</p>
            </div>
          ))}
          {!personasQuery.data?.length ? <p className="text-sm text-muted-foreground">Default personas will be seeded on first runtime access.</p> : null}
        </CardContent>
      </Card>

      {sessionsQuery.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <AgentSessionsTable onSelect={setSelectedSessionId} selectedSessionId={selectedSessionId} sessions={sessions} />
      )}

      <StateAndQualification qualification={selectedQualification} state={stateQuery.data} />
      <VoiceResponsesPanel responses={voiceResponsesQuery.data ?? []} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkflowExecutionsPanel workflows={workflowsQuery.data ?? []} />
        <ActionHistoryPanel actions={workflowActionsQuery.data ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <FollowupQueuePanel followups={followupsQuery.data ?? []} />
        <HandoffEventsPanel audits={auditsQuery.data ?? []} />
        <AuditTrailPanel audits={auditsQuery.data ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ConversationFeed conversation={selectedConversation} messages={messagesQuery.data ?? []} />
        <DecisionTimeline decisions={decisionsQuery.data ?? []} tools={toolsQuery.data ?? []} />
      </div>
    </div>
  );
}

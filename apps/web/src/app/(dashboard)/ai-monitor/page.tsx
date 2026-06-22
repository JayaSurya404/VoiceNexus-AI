"use client";

import { useEffect, useMemo, useState } from "react";

import { AgentSessionsTable } from "@/components/ai-monitor/agent-sessions-table";
import {
  AgentPerformanceAnalyticsPanel,
  AnalyticsDashboard,
  CallOutcomesPanel,
  ConversionFunnelPanel,
  QualityDashboard,
  QueueAnalyticsPanel,
  SentimentTrendsPanel,
} from "@/components/ai-monitor/analytics-panels";
import { CoachingMonitorPanel } from "@/components/ai-monitor/coaching-panels";
import { CollaborationMonitorPanel } from "@/components/ai-monitor/collaboration-panels";
import { ConversationFeed } from "@/components/ai-monitor/conversation-feed";
import { DecisionTimeline } from "@/components/ai-monitor/decision-timeline";
import {
  KnowledgeGapDashboard,
  KnowledgeImprovementPanel,
  KnowledgeSuggestionsDashboard,
  LearningEventsTimeline,
} from "@/components/ai-monitor/knowledge-learning-panels";
import { KnowledgeMonitorPanel } from "@/components/ai-monitor/knowledge-panels";
import {
  AgentPanel,
  SupervisorOverviewPanel,
  TakeoverPanel,
  WhisperAndAssistPanel,
} from "@/components/ai-monitor/human-console-panels";
import {
  AgentWorkloadPanel,
  EscalationTimelinePanel,
  QueueDashboardPanel,
  RoutingDecisionPanel,
} from "@/components/ai-monitor/queue-routing-panels";
import { RuntimeMetrics } from "@/components/ai-monitor/runtime-metrics";
import { RealtimeRuntimeMetricsPanel, RealtimeRuntimePanel } from "@/components/ai-monitor/realtime-runtime-panels";
import { RevenueIntelligencePanel } from "@/components/ai-monitor/revenue-panels";
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
  useAgentAssist,
  useAgentAvailability,
  useAgentDelegations,
  useAgentSkills,
  useAgentTeams,
  useAgentPerformanceAnalytics,
  useAnalyticsOverview,
  useAiConversations,
  useAiMessages,
  useAiQualifications,
  useAiTools,
  useActionAudits,
  useCallOutcomes,
  useAgentRecommendations,
  useCollaborations,
  useCollaborativeAgentTasks,
  useCoachingInsights,
  useCoachingMetrics,
  useCoachingSessions,
  useComplianceAlerts,
  useConversionAnalytics,
  useFollowups,
  useConversationState,
  useConversationAnalytics,
  useConversationScorecards,
  useHumanAgents,
  useHumanConsoleActions,
  useKnowledgeCitations,
  useKnowledgeDocuments,
  useKnowledgeGaps,
  useKnowledgeImprovements,
  useKnowledgeLearningEvents,
  useKnowledgeSearches,
  useKnowledgeSuggestions,
  useKnowledgeActions,
  useLiveTakeovers,
  useNextBestActions,
  useQueueHealth,
  useQueueAnalytics,
  useQueueSessions,
  useQueues,
  useQualityScores,
  useRevenueAnalytics,
  useRevenueCrossSell,
  useRevenueForecasts,
  useRevenueInsights,
  useRevenueOpportunities,
  useRevenueRisks,
  useRevenueUpsell,
  useRevenueWinLoss,
  useRoutingDecisions,
  useRuntimeMetrics,
  useSentimentAnalytics,
  useSupervisorOverview,
  useSupervisorSessions,
  useWorkflowActions,
  useWorkflows,
  useWhispers,
} from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";
import {
  useRealtimeBargeIns,
  useRealtimeConversations,
  useRealtimePlayback,
  useRealtimeRuntimeMetrics,
  useRealtimeTurns,
  useTakeoverControls,
} from "@/hooks/use-realtime-runtime";
import { useVoiceResponseMetrics, useVoiceResponses } from "@/hooks/use-voice-responses";

export default function AiMonitorPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedRuntimeConversationId, setSelectedRuntimeConversationId] = useState<string | null>(null);
  const sessionsQuery = useAgentSessions(activeOrganizationId);
  const conversationsQuery = useAiConversations(activeOrganizationId);
  const qualificationsQuery = useAiQualifications(activeOrganizationId);
  const personasQuery = useAgentPersonas(activeOrganizationId);
  const metricsQuery = useRuntimeMetrics(activeOrganizationId);
  const analyticsOverviewQuery = useAnalyticsOverview(activeOrganizationId);
  const conversationAnalyticsQuery = useConversationAnalytics(activeOrganizationId);
  const agentPerformanceQuery = useAgentPerformanceAnalytics(activeOrganizationId);
  const analyticsQueuesQuery = useQueueAnalytics(activeOrganizationId);
  const conversionAnalyticsQuery = useConversionAnalytics(activeOrganizationId);
  const callOutcomesQuery = useCallOutcomes(activeOrganizationId);
  const sentimentAnalyticsQuery = useSentimentAnalytics(activeOrganizationId);
  const qualityScoresQuery = useQualityScores(activeOrganizationId);
  const revenueAnalyticsQuery = useRevenueAnalytics(activeOrganizationId);
  const revenueForecastsQuery = useRevenueForecasts(activeOrganizationId);
  const revenueRisksQuery = useRevenueRisks(activeOrganizationId);
  const revenueOpportunitiesQuery = useRevenueOpportunities(activeOrganizationId);
  const revenueWinLossQuery = useRevenueWinLoss(activeOrganizationId);
  const revenueInsightsQuery = useRevenueInsights(activeOrganizationId);
  const revenueUpsellQuery = useRevenueUpsell(activeOrganizationId);
  const revenueCrossSellQuery = useRevenueCrossSell(activeOrganizationId);
  const knowledgeDocumentsQuery = useKnowledgeDocuments(activeOrganizationId);
  const knowledgeSearchesQuery = useKnowledgeSearches(activeOrganizationId);
  const knowledgeCitationsQuery = useKnowledgeCitations(activeOrganizationId);
  const knowledgeGapsQuery = useKnowledgeGaps(activeOrganizationId);
  const knowledgeSuggestionsQuery = useKnowledgeSuggestions(activeOrganizationId);
  const knowledgeLearningEventsQuery = useKnowledgeLearningEvents(activeOrganizationId);
  const knowledgeImprovementsQuery = useKnowledgeImprovements(activeOrganizationId);
  const knowledgeActions = useKnowledgeActions(activeOrganizationId);
  const workflowsQuery = useWorkflows(activeOrganizationId);
  const workflowActionsQuery = useWorkflowActions(activeOrganizationId);
  const followupsQuery = useFollowups(activeOrganizationId);
  const auditsQuery = useActionAudits(activeOrganizationId);
  const voiceResponsesQuery = useVoiceResponses(activeOrganizationId);
  const voiceMetricsQuery = useVoiceResponseMetrics(activeOrganizationId);
  const humanAgentsQuery = useHumanAgents(activeOrganizationId);
  const availabilityQuery = useAgentAvailability(activeOrganizationId);
  const queuesQuery = useQueues(activeOrganizationId);
  const agentSkillsQuery = useAgentSkills(activeOrganizationId);
  const agentTeamsQuery = useAgentTeams(activeOrganizationId);
  const collaborativeTasksQuery = useCollaborativeAgentTasks(activeOrganizationId);
  const agentDelegationsQuery = useAgentDelegations(activeOrganizationId);
  const collaborationsQuery = useCollaborations(activeOrganizationId);
  const coachingSessionsQuery = useCoachingSessions(activeOrganizationId);
  const coachingInsightsQuery = useCoachingInsights(activeOrganizationId);
  const coachingMetricsQuery = useCoachingMetrics(activeOrganizationId);
  const agentRecommendationsQuery = useAgentRecommendations(activeOrganizationId);
  const complianceAlertsQuery = useComplianceAlerts(activeOrganizationId);
  const conversationScorecardsQuery = useConversationScorecards(activeOrganizationId);
  const nextBestActionsQuery = useNextBestActions(activeOrganizationId);
  const queueSessionsQuery = useQueueSessions(activeOrganizationId);
  const routingDecisionsQuery = useRoutingDecisions(activeOrganizationId);
  const queueHealthQuery = useQueueHealth(activeOrganizationId);
  const takeoversQuery = useLiveTakeovers(activeOrganizationId);
  const whispersQuery = useWhispers(activeOrganizationId);
  const supervisorOverviewQuery = useSupervisorOverview(activeOrganizationId);
  const supervisorSessionsQuery = useSupervisorSessions(activeOrganizationId);
  const realtimeConversationsQuery = useRealtimeConversations(activeOrganizationId);
  const realtimeMetricsQuery = useRealtimeRuntimeMetrics(activeOrganizationId);
  const realtimeTurnsQuery = useRealtimeTurns(selectedRuntimeConversationId);
  const realtimePlaybackQuery = useRealtimePlayback(selectedRuntimeConversationId);
  const realtimeBargeInsQuery = useRealtimeBargeIns(selectedRuntimeConversationId);
  const takeoverControls = useTakeoverControls(activeOrganizationId);
  const humanConsoleActions = useHumanConsoleActions(activeOrganizationId);
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);
  const humanAgents = useMemo(() => humanAgentsQuery.data ?? [], [humanAgentsQuery.data]);
  const humanSessions = useMemo(() => supervisorSessionsQuery.data ?? [], [supervisorSessionsQuery.data]);
  const realtimeConversations = useMemo(
    () => realtimeConversationsQuery.data ?? [],
    [realtimeConversationsQuery.data],
  );

  useEffect(() => {
    if (!selectedSessionId && sessions.length) {
      setSelectedSessionId(sessions[0]?.id ?? null);
    }
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    if (!selectedRuntimeConversationId && realtimeConversations.length) {
      setSelectedRuntimeConversationId(realtimeConversations[0]?.id ?? null);
    }
  }, [realtimeConversations, selectedRuntimeConversationId]);

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
  const assistQuery = useAgentAssist(selectedSessionId);
  const selectedHumanAgent = humanAgents[0] ?? null;
  const selectedHumanSession = humanSessions.find((session) => session.aiSessionId === selectedSessionId) ?? humanSessions[0] ?? null;

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
      <AnalyticsDashboard overview={analyticsOverviewQuery.data} />
      <SupervisorOverviewPanel overview={supervisorOverviewQuery.data} />
      <QueueDashboardPanel health={queueHealthQuery.data ?? []} queues={queuesQuery.data ?? []} />
      <RealtimeRuntimeMetricsPanel metrics={realtimeMetricsQuery.data} />
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

      <AgentPanel agents={humanAgents} availability={availabilityQuery.data ?? []} />
      <AgentWorkloadPanel
        agents={humanAgents}
        availability={availabilityQuery.data ?? []}
        skills={agentSkillsQuery.data ?? []}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <RoutingDecisionPanel decisions={routingDecisionsQuery.data ?? []} />
        <EscalationTimelinePanel queues={queuesQuery.data ?? []} sessions={queueSessionsQuery.data ?? []} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <QualityDashboard qualityScores={qualityScoresQuery.data ?? []} />
        <SentimentTrendsPanel sentiments={sentimentAnalyticsQuery.data ?? []} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AgentPerformanceAnalyticsPanel agents={humanAgents} performance={agentPerformanceQuery.data ?? []} />
        <QueueAnalyticsPanel analytics={analyticsQueuesQuery.data ?? []} queues={queuesQuery.data ?? []} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ConversionFunnelPanel conversions={conversionAnalyticsQuery.data} />
        <CallOutcomesPanel outcomes={callOutcomesQuery.data ?? []} />
      </div>
      <RevenueIntelligencePanel
        crossSell={revenueCrossSellQuery.data ?? []}
        forecasts={revenueForecastsQuery.data ?? []}
        insights={revenueInsightsQuery.data ?? []}
        opportunities={revenueOpportunitiesQuery.data ?? []}
        overview={revenueAnalyticsQuery.data}
        risks={revenueRisksQuery.data ?? []}
        upsell={revenueUpsellQuery.data ?? []}
        winLoss={revenueWinLossQuery.data ?? []}
      />
      <KnowledgeMonitorPanel
        citations={knowledgeCitationsQuery.data ?? []}
        documents={knowledgeDocumentsQuery.data ?? []}
        searches={knowledgeSearchesQuery.data ?? []}
      />
      <KnowledgeImprovementPanel improvements={knowledgeImprovementsQuery.data ?? []} />
      <div className="grid gap-6 xl:grid-cols-2">
        <KnowledgeGapDashboard gaps={knowledgeGapsQuery.data ?? []} />
        <KnowledgeSuggestionsDashboard
          onApprove={(id) => knowledgeActions.approveSuggestion.mutate({ id })}
          onReject={(id) => knowledgeActions.rejectSuggestion.mutate({ id })}
          suggestions={knowledgeSuggestionsQuery.data ?? []}
        />
      </div>
      <LearningEventsTimeline events={knowledgeLearningEventsQuery.data ?? []} />
      <CollaborationMonitorPanel
        collaborations={collaborationsQuery.data}
        delegations={agentDelegationsQuery.data ?? []}
        tasks={collaborativeTasksQuery.data ?? []}
        teams={agentTeamsQuery.data ?? []}
      />
      <CoachingMonitorPanel
        alerts={complianceAlertsQuery.data ?? []}
        insights={coachingInsightsQuery.data ?? []}
        metrics={coachingMetricsQuery.data}
        nextBestActions={nextBestActionsQuery.data ?? []}
        recommendations={agentRecommendationsQuery.data ?? []}
        scorecards={conversationScorecardsQuery.data ?? []}
        sessions={coachingSessionsQuery.data ?? []}
      />
      <TakeoverPanel
        onEnd={(id) => humanConsoleActions.endTakeover.mutate(id)}
        onStart={(id) => humanConsoleActions.startTakeover.mutate(id)}
        sessions={humanSessions}
        takeovers={takeoversQuery.data ?? []}
      />
      <WhisperAndAssistPanel
        assist={assistQuery.data}
        onWhisperToAgent={(content) => {
          if (selectedHumanSession && selectedHumanAgent) {
            humanConsoleActions.createWhisper.mutate({
              sessionId: selectedHumanSession.id,
              senderId: selectedHumanAgent.id,
              senderRole: "SUPERVISOR",
              target: "AGENT",
              targetAgentId: selectedHumanAgent.id,
              content,
            });
          }
        }}
        onWhisperToAi={(content) => {
          if (selectedHumanSession && selectedHumanAgent) {
            humanConsoleActions.createWhisper.mutate({
              sessionId: selectedHumanSession.id,
              senderId: selectedHumanAgent.id,
              senderRole: "SUPERVISOR",
              target: "AI",
              content,
            });
          }
        }}
        selectedAgentId={selectedHumanAgent?.id ?? null}
        selectedSessionId={selectedHumanSession?.id ?? null}
        whispers={whispersQuery.data ?? []}
      />

      <StateAndQualification qualification={selectedQualification} state={stateQuery.data} />
      <RealtimeRuntimePanel
        bargeIns={realtimeBargeInsQuery.data ?? []}
        conversations={realtimeConversations}
        onRelease={(conversationId) => takeoverControls.release.mutate(conversationId)}
        onSelect={setSelectedRuntimeConversationId}
        onTakeover={(conversationId) => takeoverControls.takeover.mutate(conversationId)}
        playback={realtimePlaybackQuery.data ?? []}
        selectedConversationId={selectedRuntimeConversationId}
        turns={realtimeTurnsQuery.data ?? []}
      />
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

      <Card>
        <CardHeader>
          <CardTitle>Conversation analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(conversationAnalyticsQuery.data ?? []).slice(0, 8).map((item) => (
            <div className="rounded-2xl border p-4" key={item.id}>
              <p className="font-medium">Conversation {item.conversationId.slice(-8)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                QA {Math.round(item.qualityScore)} / AI {Math.round(item.aiConfidence * 100)}% / {item.sentiment}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.qualificationLevel} lead / outcome {item.outcome?.replaceAll("_", " ") ?? "pending"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

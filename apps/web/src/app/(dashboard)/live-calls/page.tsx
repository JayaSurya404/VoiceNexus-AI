"use client";

import { useEffect, useMemo, useState } from "react";

import { ActiveCallsTable } from "@/components/live-calls/active-calls-table";
import { ConnectionStatusCard } from "@/components/live-calls/connection-status-card";
import { HumanTakeoverControls } from "@/components/live-calls/human-takeover-controls";
import { LiveTranscriptPanel } from "@/components/live-calls/live-transcript-panel";
import { RealtimeEventFeed } from "@/components/live-calls/realtime-event-feed";
import { RealtimeRuntimeMetricsPanel, RealtimeRuntimePanel } from "@/components/ai-monitor/realtime-runtime-panels";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHumanAgents,
  useHumanConsoleActions,
  useLiveTakeovers,
  useSupervisorSessions,
} from "@/hooks/use-ai-brain";
import { useActiveCalls, useLiveCallsSocket } from "@/hooks/use-live-calls";
import {
  useRealtimeBargeIns,
  useRealtimeConversations,
  useRealtimePlayback,
  useRealtimeRuntimeMetrics,
  useRealtimeTurns,
  useTakeoverControls,
} from "@/hooks/use-realtime-runtime";
import { useAuthStore } from "@/store/auth-store";

export default function LiveCallsPage() {
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [selectedRuntimeConversationId, setSelectedRuntimeConversationId] = useState<string | null>(null);
  const organizationId = selectedOrganizationId || activeOrganizationId;
  const activeCallsQuery = useActiveCalls(organizationId);
  const liveSocket = useLiveCallsSocket(organizationId);
  const realtimeConversationsQuery = useRealtimeConversations(organizationId ?? null);
  const realtimeMetricsQuery = useRealtimeRuntimeMetrics(organizationId ?? null);
  const realtimeConversations = useMemo(
    () => realtimeConversationsQuery.data ?? [],
    [realtimeConversationsQuery.data],
  );
  const realtimeTurnsQuery = useRealtimeTurns(selectedRuntimeConversationId);
  const realtimePlaybackQuery = useRealtimePlayback(selectedRuntimeConversationId);
  const realtimeBargeInsQuery = useRealtimeBargeIns(selectedRuntimeConversationId);
  const takeoverControls = useTakeoverControls(organizationId ?? null);
  const humanAgentsQuery = useHumanAgents(organizationId ?? null);
  const humanSessionsQuery = useSupervisorSessions(organizationId ?? null);
  const humanTakeoversQuery = useLiveTakeovers(organizationId ?? null);
  const humanConsoleActions = useHumanConsoleActions(organizationId ?? null);
  const selectedOrganizationName = useMemo(
    () => organizations.find((organization) => organization.id === organizationId)?.name ?? "Current organization",
    [organizationId, organizations],
  );

  const calls = activeCallsQuery.data ?? [];
  useEffect(() => {
    if (!selectedRuntimeConversationId && realtimeConversations.length) {
      setSelectedRuntimeConversationId(realtimeConversations[0]?.id ?? null);
    }
  }, [realtimeConversations, selectedRuntimeConversationId]);

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
      <HumanTakeoverControls
        agents={humanAgentsQuery.data ?? []}
        calls={calls}
        onJoin={(agentId, callId) => humanConsoleActions.joinSession.mutate({ agentId, callId })}
        onRelease={(takeoverId) => humanConsoleActions.endTakeover.mutate(takeoverId)}
        onTakeover={(sessionId, agentId) =>
          void humanConsoleActions.createTakeover
            .mutateAsync({ sessionId, agentId, reason: "Live call takeover requested" })
            .then((takeover) => humanConsoleActions.startTakeover.mutate(takeover.id))
        }
        onWhisperAgent={(sessionId, agentId) =>
          humanConsoleActions.createWhisper.mutate({
            sessionId,
            senderId: agentId,
            senderRole: "SUPERVISOR",
            target: "AGENT",
            targetAgentId: agentId,
            content: "Stay concise, confirm the customer need, then ask the next discovery question.",
          })
        }
        onWhisperAi={(sessionId, agentId) =>
          humanConsoleActions.createWhisper.mutate({
            sessionId,
            senderId: agentId,
            senderRole: "SUPERVISOR",
            target: "AI",
            content: "Observe silently while the human agent handles the call.",
          })
        }
        sessions={humanSessionsQuery.data ?? []}
        takeovers={humanTakeoversQuery.data ?? []}
      />
      <RealtimeRuntimeMetricsPanel metrics={realtimeMetricsQuery.data} />
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
      <LiveTranscriptPanel partialTranscripts={liveSocket.partialTranscripts} transcripts={liveSocket.transcripts} />
      <RealtimeEventFeed events={liveSocket.events} />
    </div>
  );
}

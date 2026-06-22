"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { aiBrainApi } from "@/lib/api/ai-brain-api";

export const aiBrainKeys = {
  conversations: (organizationId: string) => ["ai", "conversations", organizationId] as const,
  messages: (conversationId: string) => ["ai", "messages", conversationId] as const,
  tools: (conversationId: string) => ["ai", "tools", conversationId] as const,
  qualifications: (organizationId: string) => ["ai", "qualifications", organizationId] as const,
  personas: (organizationId: string) => ["ai", "personas", organizationId] as const,
  sessions: (organizationId: string) => ["ai", "sessions", organizationId] as const,
  sessionState: (sessionId: string) => ["ai", "session-state", sessionId] as const,
  decisions: (sessionId: string) => ["ai", "decisions", sessionId] as const,
  metrics: (organizationId: string) => ["ai", "metrics", organizationId] as const,
  workflows: (organizationId: string) => ["ai", "workflows", organizationId] as const,
  actions: (organizationId: string) => ["ai", "actions", organizationId] as const,
  followups: (organizationId: string) => ["ai", "followups", organizationId] as const,
  audits: (organizationId: string) => ["ai", "audits", organizationId] as const,
  humanAgents: (organizationId: string) => ["ai", "human-agents", organizationId] as const,
  availability: (organizationId: string) => ["ai", "agent-availability", organizationId] as const,
  queues: (organizationId: string) => ["ai", "queues", organizationId] as const,
  queueMembers: (organizationId: string) => ["ai", "queue-members", organizationId] as const,
  agentSkills: (organizationId: string) => ["ai", "agent-skills", organizationId] as const,
  queueSessions: (organizationId: string) => ["ai", "queue-sessions", organizationId] as const,
  routingDecisions: (organizationId: string) => ["ai", "routing-decisions", organizationId] as const,
  queueHealth: (organizationId: string) => ["ai", "queue-health", organizationId] as const,
  takeovers: (organizationId: string) => ["ai", "takeovers", organizationId] as const,
  whispers: (organizationId: string) => ["ai", "whispers", organizationId] as const,
  supervisorOverview: (organizationId: string) => ["ai", "supervisor-overview", organizationId] as const,
  supervisorSessions: (organizationId: string) => ["ai", "supervisor-sessions", organizationId] as const,
  assist: (sessionId: string) => ["ai", "assist", sessionId] as const,
};

export function useAiConversations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.conversations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listConversations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAiMessages(conversationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.messages(conversationId ?? ""),
    queryFn: () => aiBrainApi.listMessages(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });
}

export function useAiTools(conversationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.tools(conversationId ?? ""),
    queryFn: () => aiBrainApi.listTools(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });
}

export function useAiQualifications(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.qualifications(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQualifications(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useAgentPersonas(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.personas(organizationId ?? ""),
    queryFn: () => aiBrainApi.listPersonas(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useAgentSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.sessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useConversationState(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.sessionState(sessionId ?? ""),
    queryFn: () => aiBrainApi.getSessionState(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 10_000,
  });
}

export function useAgentDecisions(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.decisions(sessionId ?? ""),
    queryFn: () => aiBrainApi.listSessionDecisions(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 10_000,
  });
}

export function useRuntimeMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.metrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.runtimeMetrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useWorkflows(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.workflows(organizationId ?? ""),
    queryFn: () => aiBrainApi.listWorkflows(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useWorkflowActions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.actions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listActions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useFollowups(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.followups(organizationId ?? ""),
    queryFn: () => aiBrainApi.listFollowups(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useActionAudits(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.audits(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAudits(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useHumanAgents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.humanAgents(organizationId ?? ""),
    queryFn: () => aiBrainApi.listHumanAgents(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAgentAvailability(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.availability(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAvailability(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useQueues(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queues(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueues(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useQueueMembers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueMembers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueueMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAgentSkills(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentSkills(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentSkills(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useQueueSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueSessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueueSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useRoutingDecisions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.routingDecisions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listRoutingDecisions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useQueueHealth(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueHealth(organizationId ?? ""),
    queryFn: () => aiBrainApi.queueHealth(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useLiveTakeovers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.takeovers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listTakeovers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useWhispers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.whispers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listWhispers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useSupervisorOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.supervisorOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.supervisorOverview(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useSupervisorSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.supervisorSessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.supervisorSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useAgentAssist(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.assist(sessionId ?? ""),
    queryFn: () => aiBrainApi.agentAssist(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 20_000,
  });
}

export function useHumanConsoleActions(organizationId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    if (!organizationId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.humanAgents(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.availability(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queues(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queueSessions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.routingDecisions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queueHealth(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.takeovers(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.whispers(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.supervisorSessions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.supervisorOverview(organizationId) }),
    ]);
  };

  return {
    joinSession: useMutation({
      mutationFn: (input: { agentId: string; aiSessionId?: string | null; callId?: string | null; leadId?: string | null }) =>
        aiBrainApi.joinAgentSession(input.agentId, {
          organizationId: organizationId ?? "",
          aiSessionId: input.aiSessionId,
          callId: input.callId,
          leadId: input.leadId,
        }),
      onSuccess: invalidate,
    }),
    createTakeover: useMutation({
      mutationFn: (input: { sessionId: string; agentId: string; reason: string }) =>
        aiBrainApi.createTakeover({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
    startTakeover: useMutation({
      mutationFn: (id: string) => aiBrainApi.startTakeover(id),
      onSuccess: invalidate,
    }),
    endTakeover: useMutation({
      mutationFn: (id: string) => aiBrainApi.endTakeover(id),
      onSuccess: invalidate,
    }),
    createWhisper: useMutation({
      mutationFn: (input: {
        sessionId: string;
        senderId: string;
        senderRole: "SUPERVISOR" | "AGENT";
        target: "AGENT" | "AI";
        targetAgentId?: string | null;
        content: string;
      }) => aiBrainApi.createWhisper({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
  };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { aiBrainApi } from "@/lib/api/ai-brain-api";

export const runtimeOrchestrationKeys = {
  overview: (organizationId: string) => ["ai-brain", "runtime-orchestration", organizationId] as const,
  providerConfig: (organizationId: string) => ["ai-brain", "runtime-provider-config", organizationId] as const,
  sessions: (organizationId: string) => ["ai-brain", "runtime-sessions", organizationId] as const,
  fallbacks: (organizationId: string) => ["ai-brain", "runtime-fallbacks", organizationId] as const,
  incidents: (organizationId: string) => ["ai-brain", "runtime-incidents", organizationId] as const,
  turns: (organizationId: string, sessionId: string) => ["ai-brain", "runtime-turns", organizationId, sessionId] as const
};

export function useRuntimeOrchestrationOverview(organizationId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.overview(organizationId),
    queryFn: () => aiBrainApi.runtimeOrchestration(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useRuntimeSessions(organizationId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.sessions(organizationId),
    queryFn: () => aiBrainApi.runtimeSessions(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useRuntimeProviderConfig(organizationId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.providerConfig(organizationId),
    queryFn: () => aiBrainApi.runtimeProviderConfig(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useRuntimeFallbacks(organizationId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.fallbacks(organizationId),
    queryFn: () => aiBrainApi.runtimeFallbacks(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useRuntimeIncidents(organizationId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.incidents(organizationId),
    queryFn: () => aiBrainApi.runtimeIncidents(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useRuntimeSessionTurns(organizationId: string, sessionId: string) {
  return useQuery({
    queryKey: runtimeOrchestrationKeys.turns(organizationId, sessionId),
    queryFn: () => aiBrainApi.runtimeSessionTurns(organizationId, sessionId),
    enabled: Boolean(organizationId && sessionId)
  });
}

export function useRuntimeOrchestrationActions(organizationId: string) {
  const queryClient = useQueryClient();
  const invalidateRuntime = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: runtimeOrchestrationKeys.overview(organizationId) }),
      queryClient.invalidateQueries({ queryKey: runtimeOrchestrationKeys.providerConfig(organizationId) }),
      queryClient.invalidateQueries({ queryKey: runtimeOrchestrationKeys.sessions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: runtimeOrchestrationKeys.fallbacks(organizationId) }),
      queryClient.invalidateQueries({ queryKey: runtimeOrchestrationKeys.incidents(organizationId) })
    ]);
  };

  return {
    createSession: useMutation({
      mutationFn: (input: { conversationId?: string; direction?: "INBOUND" | "OUTBOUND"; callSid?: string; metadata?: Record<string, unknown> }) =>
        aiBrainApi.createRuntimeSession(organizationId, input),
      onSuccess: invalidateRuntime
    }),
    sendMessage: useMutation({
      mutationFn: (input: {
        sessionId: string;
        userMessage: string;
        memoryContext?: string;
        crmContext?: string;
        knowledgeContext?: string;
      }) => aiBrainApi.sendRuntimeConversationMessage(organizationId, input),
      onSuccess: invalidateRuntime
    }),
    escalate: useMutation({
      mutationFn: (input: { sessionId: string; reason: string; queueId?: string; agentId?: string; supervisorId?: string }) =>
        aiBrainApi.escalateRuntimeSession(organizationId, input),
      onSuccess: invalidateRuntime
    }),
    updateProviderConfig: useMutation({
      mutationFn: (input: Parameters<typeof aiBrainApi.updateRuntimeProviderConfig>[1]) =>
        aiBrainApi.updateRuntimeProviderConfig(organizationId, input),
      onSuccess: invalidateRuntime
    })
  };
}

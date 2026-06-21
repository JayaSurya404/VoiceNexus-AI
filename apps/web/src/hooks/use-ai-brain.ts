"use client";

import { useQuery } from "@tanstack/react-query";

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

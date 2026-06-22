"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { realtimeRuntimeApi } from "@/lib/api/realtime-runtime-api";

export const realtimeRuntimeKeys = {
  conversations: (organizationId: string) => ["realtime-runtime", "conversations", organizationId] as const,
  metrics: (organizationId: string) => ["realtime-runtime", "metrics", organizationId] as const,
  turns: (conversationId: string) => ["realtime-runtime", "turns", conversationId] as const,
  playback: (conversationId: string) => ["realtime-runtime", "playback", conversationId] as const,
  bargeIns: (conversationId: string) => ["realtime-runtime", "bargeins", conversationId] as const,
};

export function useRealtimeConversations(organizationId: string | null) {
  return useQuery({
    queryKey: realtimeRuntimeKeys.conversations(organizationId ?? ""),
    queryFn: () => realtimeRuntimeApi.listConversations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 5_000,
  });
}

export function useRealtimeRuntimeMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: realtimeRuntimeKeys.metrics(organizationId ?? ""),
    queryFn: () => realtimeRuntimeApi.getMetrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 5_000,
  });
}

export function useRealtimeTurns(conversationId: string | null) {
  return useQuery({
    queryKey: realtimeRuntimeKeys.turns(conversationId ?? ""),
    queryFn: () => realtimeRuntimeApi.getTurns(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 5_000,
  });
}

export function useRealtimePlayback(conversationId: string | null) {
  return useQuery({
    queryKey: realtimeRuntimeKeys.playback(conversationId ?? ""),
    queryFn: () => realtimeRuntimeApi.getPlayback(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 5_000,
  });
}

export function useRealtimeBargeIns(conversationId: string | null) {
  return useQuery({
    queryKey: realtimeRuntimeKeys.bargeIns(conversationId ?? ""),
    queryFn: () => realtimeRuntimeApi.getBargeIns(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 5_000,
  });
}

export function useTakeoverControls(organizationId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    if (organizationId) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: realtimeRuntimeKeys.conversations(organizationId) }),
        queryClient.invalidateQueries({ queryKey: realtimeRuntimeKeys.metrics(organizationId) }),
      ]);
    }
  };

  return {
    release: useMutation({
      mutationFn: (conversationId: string) => realtimeRuntimeApi.release(conversationId),
      onSuccess: invalidate,
    }),
    takeover: useMutation({
      mutationFn: (conversationId: string) => realtimeRuntimeApi.takeover(conversationId),
      onSuccess: invalidate,
    }),
  };
}

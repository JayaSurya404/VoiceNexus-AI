"use client";

import { useQuery } from "@tanstack/react-query";

import { voiceResponsesApi } from "@/lib/api/voice-responses-api";

export const voiceResponseKeys = {
  list: (organizationId: string) => ["voice-responses", organizationId] as const,
  metrics: (organizationId: string) => ["voice-responses", "metrics", organizationId] as const,
};

export function useVoiceResponses(organizationId: string | null) {
  return useQuery({
    queryKey: voiceResponseKeys.list(organizationId ?? ""),
    queryFn: () => voiceResponsesApi.list(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useVoiceResponseMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: voiceResponseKeys.metrics(organizationId ?? ""),
    queryFn: () => voiceResponsesApi.metrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

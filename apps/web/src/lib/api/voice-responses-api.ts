"use client";

import { useAuthStore } from "@/store/auth-store";

const realtimeGatewayUrl = process.env.NEXT_PUBLIC_REALTIME_GATEWAY_URL ?? "http://localhost:4001";

interface ApiResponse<T> {
  data: T;
}

interface ErrorResponse {
  error: { code: string; message: string };
}

export interface VoiceResponseDto {
  id: string;
  organizationId: string;
  sessionId: string | null;
  callId: string;
  leadId: string | null;
  responseText: string;
  provider: string;
  voice: string;
  audioUrl: string | null;
  durationMs: number;
  audioBytes: number;
  status: "PENDING" | "GENERATING" | "QUEUED" | "PLAYING" | "COMPLETED" | "FAILED";
  latencyMs: number | null;
  playbackStartedAt: string | null;
  playbackCompletedAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceResponseMetricsDto {
  responsesGenerated: number;
  audioSecondsGenerated: number;
  averageLatency: number;
  providerUsage: Record<string, number>;
  playbackSuccessRate: number;
}

async function request<T>(path: string): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const response = await fetch(`${realtimeGatewayUrl}${path}`, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
  });
  const payload = (await response.json()) as ApiResponse<T> | ErrorResponse;

  if (!response.ok) {
    const error = payload as ErrorResponse;
    throw new Error(error.error.message);
  }

  return (payload as ApiResponse<T>).data;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

export const voiceResponsesApi = {
  list: (organizationId: string) => request<VoiceResponseDto[]>(`/voice-responses?${query({ organizationId })}`),
  metrics: (organizationId: string) =>
    request<VoiceResponseMetricsDto>(`/voice-responses/metrics?${query({ organizationId })}`),
  listBySession: (organizationId: string, sessionId: string) =>
    request<VoiceResponseDto[]>(`/voice-responses/session/${encodeURIComponent(sessionId)}?${query({ organizationId })}`),
};

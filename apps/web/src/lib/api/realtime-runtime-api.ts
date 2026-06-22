"use client";

import { useAuthStore } from "@/store/auth-store";

const realtimeGatewayUrl = process.env.NEXT_PUBLIC_REALTIME_GATEWAY_URL ?? "http://localhost:4001";

interface ApiResponse<T> {
  data: T;
}

interface ErrorResponse {
  error: { code: string; message: string };
}

export type SpeechStateName = "LISTENING" | "PROCESSING" | "RESPONDING" | "INTERRUPTED" | "TRANSFERRED" | "COMPLETED";

export interface RealtimeConversationDto {
  id: string;
  organizationId: string;
  callSessionId: string;
  aiSessionId: string | null;
  status: "ACTIVE" | "TAKEOVER" | "COMPLETED" | "FAILED";
  speechState: SpeechStateName;
  currentTurnId: string | null;
  activePlaybackSessionId: string | null;
  takeoverActive: boolean;
  takeoverBy: string | null;
  startedAt: string;
  endedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TurnEventDto {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  type: "CUSTOMER_TURN_STARTED" | "CUSTOMER_TURN_ENDED" | "AI_TURN_STARTED" | "AI_TURN_ENDED";
  speaker: "CUSTOMER" | "AI";
  transcript: string | null;
  latencyMs: number | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export interface PlaybackSessionDto {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  voiceResponseId: string;
  status: "QUEUED" | "PLAYING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED";
  progressMs: number;
  durationMs: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BargeInEventDto {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  playbackSessionId: string | null;
  voiceResponseId: string | null;
  transcriptFragment: string | null;
  reason: string;
  detectedAt: string;
  createdAt: string;
}

export interface RealtimeRuntimeMetricsDto {
  sttLatency: number;
  aiLatency: number;
  ttsLatency: number;
  playbackLatency: number;
  totalLatency: number;
  activeConversations: number;
  bargeIns: number;
  takeoverActive: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }
  const response = await fetch(`${realtimeGatewayUrl}${path}`, { ...options, headers });
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

export const realtimeRuntimeApi = {
  listConversations: (organizationId: string) =>
    request<RealtimeConversationDto[]>(`/realtime/conversations?${query({ organizationId })}`),
  getMetrics: (organizationId: string) =>
    request<RealtimeRuntimeMetricsDto>(`/realtime/metrics?${query({ organizationId })}`),
  getTurns: (conversationId: string) =>
    request<TurnEventDto[]>(`/realtime/conversations/${encodeURIComponent(conversationId)}/turns`),
  getPlayback: (conversationId: string) =>
    request<PlaybackSessionDto[]>(`/realtime/conversations/${encodeURIComponent(conversationId)}/playback`),
  getBargeIns: (conversationId: string) =>
    request<BargeInEventDto[]>(`/realtime/conversations/${encodeURIComponent(conversationId)}/bargeins`),
  takeover: (conversationId: string) =>
    request<RealtimeConversationDto>(`/realtime/conversations/${encodeURIComponent(conversationId)}/takeover`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  release: (conversationId: string) =>
    request<RealtimeConversationDto>(`/realtime/conversations/${encodeURIComponent(conversationId)}/release`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};

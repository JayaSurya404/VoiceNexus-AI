"use client";

import { useAuthStore } from "@/store/auth-store";

const aiBrainUrl = process.env.NEXT_PUBLIC_AI_BRAIN_URL ?? "http://localhost:4002";

interface ApiResponse<T> {
  data: T;
}

interface ErrorResponse {
  error: { code: string; message: string };
}

export interface AiConversationDto {
  id: string;
  organizationId: string;
  leadId: string | null;
  callId: string | null;
  status: "ACTIVE" | "ENDED" | "FAILED";
  currentIntent: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" | "UNKNOWN";
  leadScore: number;
  summary: string | null;
  outcome: string | null;
  nextActions: string[];
  state: { lastResponse: string | null; detectedLanguage: string | null };
  updatedAt: string;
}

export interface AiMessageDto {
  id: string;
  conversationId: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tokens: number;
  timestamp: string;
}

export interface ToolExecutionDto {
  id: string;
  conversationId: string | null;
  agentSessionId: string | null;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  success: boolean;
  error: string | null;
  executedAt: string;
}

export interface LeadQualificationDto {
  id: string;
  organizationId: string;
  leadId: string;
  conversationId: string | null;
  agentSessionId: string | null;
  score: number;
  confidence: number;
  hotScore: number;
  warmScore: number;
  coldScore: number;
  budgetDetected: boolean;
  authorityDetected: boolean;
  needDetected: boolean;
  timelineDetected: boolean;
  interestLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
  qualificationReason: string;
  updatedAt: string;
}

export interface AgentPersonaDto {
  id: string;
  organizationId: string;
  name: string;
  role: "SALES_AGENT" | "SUPPORT_AGENT" | "APPOINTMENT_SETTER" | "COLLECTIONS_AGENT";
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSessionDto {
  id: string;
  organizationId: string;
  agentPersonaId: string;
  leadId: string | null;
  callId: string | null;
  aiConversationId: string | null;
  status: "ACTIVE" | "PAUSED" | "TRANSFERRED" | "COMPLETED" | "FAILED";
  startedAt: string;
  endedAt: string | null;
  lastTranscriptAt: string | null;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationStateDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  leadId: string | null;
  callId: string | null;
  state: "GREETING" | "DISCOVERY" | "QUALIFICATION" | "OBJECTION" | "PRICING" | "FOLLOWUP" | "TRANSFER" | "COMPLETED";
  previousState: string | null;
  detectedIntent: string;
  detectedLanguage: string | null;
  sentiment: string;
  confidence: number;
  collectedFacts: Record<string, string>;
  transitionReason: string;
  updatedAt: string;
}

export interface AgentDecisionDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  aiConversationId: string | null;
  type: "STATE_TRANSITION" | "QUALIFICATION" | "OBJECTION" | "FOLLOWUP" | "HANDOFF" | "TOOL_CALL" | "RESPONSE";
  state: string;
  decision: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RuntimeMetricsDto {
  activeSessions: number;
  completedSessions: number;
  handoffDecisions: number;
  averageConfidence: number;
  hotLeads: number;
}

export class AiBrainClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AiBrainClientError";
  }
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${aiBrainUrl}${path}`, { ...init, headers });
  const payload = (await response.json()) as ApiResponse<T> | ErrorResponse;

  if (!response.ok) {
    const error = payload as ErrorResponse;
    throw new AiBrainClientError(response.status, error.error.code, error.error.message);
  }

  return (payload as ApiResponse<T>).data;
}

export const aiBrainApi = {
  listConversations: (organizationId: string) =>
    request<AiConversationDto[]>(`/ai/conversations?${query({ organizationId })}`),
  listMessages: (conversationId: string) =>
    request<AiMessageDto[]>(`/ai/conversations/${encodeURIComponent(conversationId)}/messages`),
  listTools: (conversationId: string) =>
    request<ToolExecutionDto[]>(`/ai/conversations/${encodeURIComponent(conversationId)}/tools`),
  listQualifications: (organizationId: string) =>
    request<LeadQualificationDto[]>(`/ai/qualifications?${query({ organizationId })}`),
  listPersonas: (organizationId: string) => request<AgentPersonaDto[]>(`/ai/personas?${query({ organizationId })}`),
  listSessions: (organizationId: string) => request<AgentSessionDto[]>(`/ai/sessions?${query({ organizationId })}`),
  getSessionState: (sessionId: string) =>
    request<ConversationStateDto | null>(`/ai/sessions/${encodeURIComponent(sessionId)}/state`),
  listSessionDecisions: (sessionId: string) =>
    request<AgentDecisionDto[]>(`/ai/sessions/${encodeURIComponent(sessionId)}/decisions`),
  runtimeMetrics: (organizationId: string) =>
    request<RuntimeMetricsDto>(`/ai/runtime/metrics?${query({ organizationId })}`),
};

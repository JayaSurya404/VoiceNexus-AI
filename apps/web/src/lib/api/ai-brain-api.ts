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
  actionSuccessRate?: number;
  pendingFollowups?: number;
}

export interface WorkflowExecutionDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  conversationId: string | null;
  leadId: string | null;
  trigger: "TRANSCRIPT_FINAL" | "MANUAL" | "SYSTEM";
  status: "PLANNED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  plannedActions: string[];
  completedActions: number;
  failedActions: number;
  reasoning: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowActionDto {
  id: string;
  organizationId: string;
  workflowExecutionId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string | null;
  actionType: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "SKIPPED";
  reasoning: string;
  confidence: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledFollowupDto {
  id: string;
  organizationId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string;
  assignedTo: string | null;
  followupDate: string;
  reason: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ActionAuditDto {
  id: string;
  organizationId: string;
  sessionId: string | null;
  conversationId: string | null;
  workflowExecutionId: string | null;
  workflowActionId: string | null;
  actionType: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  reasoning: string;
  confidence: number;
  createdAt: string;
}

export interface HumanAgentDto {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: "AGENT" | "SUPERVISOR" | "MANAGER";
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
  activeSessionId: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentAvailabilityDto {
  id: string;
  organizationId: string;
  agentId: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  updatedAt: string;
}

export interface HumanAgentSessionDto {
  id: string;
  organizationId: string;
  agentId: string;
  aiSessionId: string | null;
  callId: string | null;
  leadId: string | null;
  status: "JOINED" | "ACTIVE" | "ENDED";
  controller: "AI" | "HUMAN" | "SUPERVISOR";
  joinedAt: string;
  leftAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveTakeoverDto {
  id: string;
  organizationId: string;
  sessionId: string;
  agentId: string;
  supervisorId: string | null;
  status: "REQUESTED" | "APPROVED" | "ACTIVE" | "ENDED" | "REJECTED";
  reason: string;
  requestedAt: string;
  approvedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  returnedToAiAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WhisperMessageDto {
  id: string;
  organizationId: string;
  sessionId: string;
  senderId: string;
  senderRole: "SUPERVISOR" | "AGENT";
  target: "AGENT" | "AI";
  targetAgentId: string | null;
  content: string;
  private: true;
  createdAt: string;
}

export interface SupervisorOverviewDto {
  activeCalls: number;
  activeAgents: number;
  activeAiSessions: number;
  activeTakeovers: number;
  averageAiConfidence: number;
  hotQualifications: number;
  runningWorkflows: number;
}

export interface AgentAssistSuggestionDto {
  sessionId: string;
  suggestedResponses: string[];
  objectionHints: string[];
  memoryInsights: string[];
  qualificationInsights: string[];
  recommendedNextActions: string[];
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
  listWorkflows: (organizationId: string) =>
    request<WorkflowExecutionDto[]>(`/ai/workflows?${query({ organizationId })}`),
  listActions: (organizationId: string) =>
    request<WorkflowActionDto[]>(`/ai/actions?${query({ organizationId })}`),
  listFollowups: (organizationId: string) =>
    request<ScheduledFollowupDto[]>(`/ai/followups?${query({ organizationId })}`),
  completeFollowup: (id: string, organizationId: string) =>
    request<ScheduledFollowupDto>(`/ai/followups/${encodeURIComponent(id)}/complete?${query({ organizationId })}`, {
      method: "POST",
    }),
  listAudits: (organizationId: string) =>
    request<ActionAuditDto[]>(`/ai/audits?${query({ organizationId })}`),
  listHumanAgents: (organizationId: string) => request<HumanAgentDto[]>(`/agents?${query({ organizationId })}`),
  createHumanAgent: (input: Pick<HumanAgentDto, "organizationId" | "name" | "email" | "role" | "skills">) =>
    request<HumanAgentDto>("/agents", { method: "POST", body: JSON.stringify(input) }),
  listAvailability: (organizationId: string) =>
    request<AgentAvailabilityDto[]>(`/agents/availability?${query({ organizationId })}`),
  updateAvailability: (
    agentId: string,
    input: { organizationId: string; status: HumanAgentDto["status"]; statusReason?: string | null; capacity?: number },
  ) => request(`/agents/${encodeURIComponent(agentId)}/availability`, { method: "PUT", body: JSON.stringify(input) }),
  joinAgentSession: (
    agentId: string,
    input: { organizationId: string; aiSessionId?: string | null; callId?: string | null; leadId?: string | null },
  ) => request<HumanAgentSessionDto>(`/agents/${encodeURIComponent(agentId)}/sessions`, { method: "POST", body: JSON.stringify(input) }),
  listTakeovers: (organizationId: string) => request<LiveTakeoverDto[]>(`/takeovers?${query({ organizationId })}`),
  createTakeover: (input: { organizationId: string; sessionId: string; agentId: string; supervisorId?: string | null; reason: string }) =>
    request<LiveTakeoverDto>("/takeovers", { method: "POST", body: JSON.stringify(input) }),
  startTakeover: (id: string) => request<LiveTakeoverDto>(`/takeovers/${encodeURIComponent(id)}/start`, { method: "POST" }),
  endTakeover: (id: string) => request<LiveTakeoverDto>(`/takeovers/${encodeURIComponent(id)}/end`, { method: "POST" }),
  listWhispers: (organizationId: string) => request<WhisperMessageDto[]>(`/whispers?${query({ organizationId })}`),
  createWhisper: (input: {
    organizationId: string;
    sessionId: string;
    senderId: string;
    senderRole: "SUPERVISOR" | "AGENT";
    target: "AGENT" | "AI";
    targetAgentId?: string | null;
    content: string;
  }) => request<WhisperMessageDto>("/whispers", { method: "POST", body: JSON.stringify(input) }),
  supervisorOverview: (organizationId: string) =>
    request<SupervisorOverviewDto>(`/supervisor/overview?${query({ organizationId })}`),
  supervisorSessions: (organizationId: string) =>
    request<HumanAgentSessionDto[]>(`/supervisor/sessions?${query({ organizationId })}`),
  agentAssist: (sessionId: string) => request<AgentAssistSuggestionDto | null>(`/assist/${encodeURIComponent(sessionId)}`),
};

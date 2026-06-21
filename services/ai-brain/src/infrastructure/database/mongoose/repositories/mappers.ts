import type { AgentDecision } from "../../../../domain/entities/agent-decision.js";
import type { AgentPersona } from "../../../../domain/entities/agent-persona.js";
import type { AgentSession } from "../../../../domain/entities/agent-session.js";
import type { AIConversation } from "../../../../domain/entities/ai-conversation.js";
import type { AIMessage } from "../../../../domain/entities/ai-message.js";
import type { ConversationState } from "../../../../domain/entities/conversation-state.js";
import type { LeadQualification } from "../../../../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../../../../domain/entities/tool-execution.js";

type Doc = Record<string, unknown> & { _id: { toString(): string } };

const id = (value: unknown): string | null => (value && typeof value === "object" && "toString" in value ? String(value) : null);
const date = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));
const mapRecord = (value: unknown): Record<string, string> =>
  value instanceof Map ? Object.fromEntries(value.entries()) : (value as Record<string, string>) ?? {};

export function toAIConversation(doc: Doc): AIConversation {
  const state = (doc.state as AIConversation["state"] | undefined) ?? {
    detectedLanguage: null,
    qualificationProgress: { budget: false, urgency: false, authority: false },
    collectedFacts: {},
    lastResponse: null,
  };
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    leadId: id(doc.leadId),
    callId: id(doc.callId),
    status: doc.status as AIConversation["status"],
    currentIntent: String(doc.currentIntent),
    sentiment: doc.sentiment as AIConversation["sentiment"],
    leadScore: Number(doc.leadScore),
    summary: doc.summary ? String(doc.summary) : null,
    outcome: doc.outcome ? String(doc.outcome) : null,
    nextActions: (doc.nextActions as string[] | undefined) ?? [],
    actionItems: (doc.actionItems as string[] | undefined) ?? [],
    customerConcerns: (doc.customerConcerns as string[] | undefined) ?? [],
    opportunities: (doc.opportunities as string[] | undefined) ?? [],
    state: { ...state, collectedFacts: mapRecord(state.collectedFacts) },
    startedAt: date(doc.startedAt),
    endedAt: doc.endedAt ? date(doc.endedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAIMessage(doc: Doc): AIMessage {
  return {
    id: doc._id.toString(),
    conversationId: id(doc.conversationId) ?? "",
    role: doc.role as AIMessage["role"],
    content: String(doc.content),
    tokens: Number(doc.tokens),
    timestamp: date(doc.timestamp),
  };
}

export function toToolExecution(doc: Doc): ToolExecution {
  return {
    id: doc._id.toString(),
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    toolName: String(doc.toolName),
    input: (doc.input as Record<string, unknown>) ?? {},
    output: (doc.output as Record<string, unknown>) ?? {},
    success: Boolean(doc.success),
    error: doc.error ? String(doc.error) : null,
    executedAt: date(doc.executedAt),
  };
}

export function toLeadQualification(doc: Doc): LeadQualification {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    leadId: id(doc.leadId) ?? "",
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    score: Number(doc.score),
    confidence: Number(doc.confidence ?? 0),
    hotScore: Number(doc.hotScore),
    warmScore: Number(doc.warmScore),
    coldScore: Number(doc.coldScore),
    budgetDetected: Boolean(doc.budgetDetected),
    authorityDetected: Boolean(doc.authorityDetected),
    needDetected: Boolean(doc.needDetected),
    timelineDetected: Boolean(doc.timelineDetected),
    urgencyDetected: Boolean(doc.urgencyDetected),
    decisionMakerDetected: Boolean(doc.decisionMakerDetected),
    objections: (doc.objections as string[] | undefined) ?? [],
    interestLevel: doc.interestLevel as LeadQualification["interestLevel"],
    qualificationReason: String(doc.qualificationReason),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentSession(doc: Doc): AgentSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentPersonaId: id(doc.agentPersonaId) ?? "",
    leadId: id(doc.leadId),
    callId: id(doc.callId),
    aiConversationId: id(doc.aiConversationId),
    status: doc.status as AgentSession["status"],
    startedAt: date(doc.startedAt),
    endedAt: doc.endedAt ? date(doc.endedAt) : null,
    lastTranscriptAt: doc.lastTranscriptAt ? date(doc.lastTranscriptAt) : null,
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentPersona(doc: Doc): AgentPersona {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    role: doc.role as AgentPersona["role"],
    systemPrompt: String(doc.systemPrompt),
    tone: String(doc.tone),
    goals: (doc.goals as string[] | undefined) ?? [],
    constraints: (doc.constraints as string[] | undefined) ?? [],
    isDefault: Boolean(doc.isDefault),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toConversationState(doc: Doc): ConversationState {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentSessionId: id(doc.agentSessionId) ?? "",
    leadId: id(doc.leadId),
    callId: id(doc.callId),
    state: doc.state as ConversationState["state"],
    previousState: (doc.previousState as ConversationState["previousState"]) ?? null,
    detectedIntent: String(doc.detectedIntent),
    detectedLanguage: doc.detectedLanguage ? String(doc.detectedLanguage) : null,
    sentiment: doc.sentiment as ConversationState["sentiment"],
    confidence: Number(doc.confidence),
    collectedFacts: mapRecord(doc.collectedFacts),
    transitionReason: String(doc.transitionReason),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentDecision(doc: Doc): AgentDecision {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentSessionId: id(doc.agentSessionId) ?? "",
    aiConversationId: id(doc.aiConversationId),
    type: doc.type as AgentDecision["type"],
    state: doc.state as AgentDecision["state"],
    decision: String(doc.decision),
    confidence: Number(doc.confidence),
    reasoning: String(doc.reasoning),
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: date(doc.createdAt),
  };
}

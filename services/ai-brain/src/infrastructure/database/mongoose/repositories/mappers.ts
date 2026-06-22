import type { AgentDecision } from "../../../../domain/entities/agent-decision.js";
import type { AgentPersona } from "../../../../domain/entities/agent-persona.js";
import type { AgentSession } from "../../../../domain/entities/agent-session.js";
import type { AIConversation } from "../../../../domain/entities/ai-conversation.js";
import type { AIMessage } from "../../../../domain/entities/ai-message.js";
import type { ConversationState } from "../../../../domain/entities/conversation-state.js";
import type { LeadQualification } from "../../../../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../../../../domain/entities/tool-execution.js";
import type { ActionAudit } from "../../../../domain/entities/action-audit.js";
import type { ScheduledFollowup } from "../../../../domain/entities/scheduled-followup.js";
import type { WorkflowAction } from "../../../../domain/entities/workflow-action.js";
import type { WorkflowExecution } from "../../../../domain/entities/workflow-execution.js";
import type { Agent } from "../../../../domain/entities/agent.js";
import type { AgentAvailability } from "../../../../domain/entities/agent-availability.js";
import type { HumanAgentSession } from "../../../../domain/entities/human-agent-session.js";
import type { LiveTakeover } from "../../../../domain/entities/live-takeover.js";
import type { SupervisorSession } from "../../../../domain/entities/supervisor-session.js";
import type { WhisperMessage } from "../../../../domain/entities/whisper-message.js";
import type { AgentSkill } from "../../../../domain/entities/agent-skill.js";
import type { Queue } from "../../../../domain/entities/queue.js";
import type { QueueMember } from "../../../../domain/entities/queue-member.js";
import type { QueueSession } from "../../../../domain/entities/queue-session.js";
import type { RoutingDecision } from "../../../../domain/entities/routing-decision.js";
import type { RoutingRule } from "../../../../domain/entities/routing-rule.js";

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

export function toWorkflowExecution(doc: Doc): WorkflowExecution {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentSessionId: id(doc.agentSessionId) ?? "",
    conversationId: id(doc.conversationId),
    leadId: id(doc.leadId),
    trigger: doc.trigger as WorkflowExecution["trigger"],
    status: doc.status as WorkflowExecution["status"],
    plannedActions: (doc.plannedActions as WorkflowExecution["plannedActions"] | undefined) ?? [],
    completedActions: Number(doc.completedActions),
    failedActions: Number(doc.failedActions),
    reasoning: String(doc.reasoning),
    startedAt: date(doc.startedAt),
    completedAt: doc.completedAt ? date(doc.completedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toWorkflowAction(doc: Doc): WorkflowAction {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    workflowExecutionId: id(doc.workflowExecutionId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    conversationId: id(doc.conversationId),
    leadId: id(doc.leadId),
    actionType: doc.actionType as WorkflowAction["actionType"],
    toolName: String(doc.toolName),
    input: (doc.input as Record<string, unknown>) ?? {},
    output: (doc.output as Record<string, unknown>) ?? {},
    status: doc.status as WorkflowAction["status"],
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    error: doc.error ? String(doc.error) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toScheduledFollowup(doc: Doc): ScheduledFollowup {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    conversationId: id(doc.conversationId),
    leadId: id(doc.leadId) ?? "",
    assignedTo: id(doc.assignedTo),
    followupDate: date(doc.followupDate),
    reason: String(doc.reason),
    priority: doc.priority as ScheduledFollowup["priority"],
    status: doc.status as ScheduledFollowup["status"],
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
    completedAt: doc.completedAt ? date(doc.completedAt) : null,
  };
}

export function toActionAudit(doc: Doc): ActionAudit {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    sessionId: id(doc.sessionId),
    conversationId: id(doc.conversationId),
    workflowExecutionId: id(doc.workflowExecutionId),
    workflowActionId: id(doc.workflowActionId),
    actionType: doc.actionType as ActionAudit["actionType"],
    toolName: String(doc.toolName),
    input: (doc.input as Record<string, unknown>) ?? {},
    output: (doc.output as Record<string, unknown>) ?? {},
    status: doc.status as ActionAudit["status"],
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
  };
}

export function toHumanAgent(doc: Doc): Agent {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    email: String(doc.email),
    role: doc.role as Agent["role"],
    status: doc.status as Agent["status"],
    activeSessionId: id(doc.activeSessionId),
    skills: (doc.skills as string[] | undefined) ?? [],
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentAvailability(doc: Doc): AgentAvailability {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentId: id(doc.agentId) ?? "",
    status: doc.status as AgentAvailability["status"],
    statusReason: doc.statusReason ? String(doc.statusReason) : null,
    capacity: Number(doc.capacity),
    activeSessionCount: Number(doc.activeSessionCount),
    updatedAt: date(doc.updatedAt),
  };
}

export function toHumanAgentSession(doc: Doc): HumanAgentSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentId: id(doc.agentId) ?? "",
    aiSessionId: id(doc.aiSessionId),
    callId: id(doc.callId),
    leadId: id(doc.leadId),
    status: doc.status as HumanAgentSession["status"],
    controller: doc.controller as HumanAgentSession["controller"],
    joinedAt: date(doc.joinedAt),
    leftAt: doc.leftAt ? date(doc.leftAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toLiveTakeover(doc: Doc): LiveTakeover {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    sessionId: id(doc.sessionId) ?? "",
    agentId: id(doc.agentId) ?? "",
    supervisorId: id(doc.supervisorId),
    status: doc.status as LiveTakeover["status"],
    reason: String(doc.reason),
    requestedAt: date(doc.requestedAt),
    approvedAt: doc.approvedAt ? date(doc.approvedAt) : null,
    startedAt: doc.startedAt ? date(doc.startedAt) : null,
    endedAt: doc.endedAt ? date(doc.endedAt) : null,
    returnedToAiAt: doc.returnedToAiAt ? date(doc.returnedToAiAt) : null,
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toWhisperMessage(doc: Doc): WhisperMessage {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    sessionId: id(doc.sessionId) ?? "",
    senderId: id(doc.senderId) ?? "",
    senderRole: doc.senderRole as WhisperMessage["senderRole"],
    target: doc.target as WhisperMessage["target"],
    targetAgentId: id(doc.targetAgentId),
    content: String(doc.content),
    private: true,
    createdAt: date(doc.createdAt),
  };
}

export function toSupervisorSession(doc: Doc): SupervisorSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    supervisorId: id(doc.supervisorId) ?? "",
    status: doc.status as SupervisorSession["status"],
    startedAt: date(doc.startedAt),
    endedAt: doc.endedAt ? date(doc.endedAt) : null,
    watchedSessionIds: ((doc.watchedSessionIds as unknown[] | undefined) ?? []).map((value) => id(value) ?? ""),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toQueue(doc: Doc): Queue {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    priority: Number(doc.priority),
    maxWaitingTime: Number(doc.maxWaitingTime),
    overflowQueueId: id(doc.overflowQueueId),
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toQueueMember(doc: Doc): QueueMember {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    queueId: id(doc.queueId) ?? "",
    agentId: id(doc.agentId) ?? "",
    role: doc.role as QueueMember["role"],
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toRoutingRule(doc: Doc): RoutingRule {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    priority: Number(doc.priority),
    requiredSkills: (doc.requiredSkills as string[] | undefined) ?? [],
    conditions: (doc.conditions as Record<string, unknown>) ?? {},
    targetQueueId: id(doc.targetQueueId),
    escalationQueueId: id(doc.escalationQueueId),
    action: doc.action as RoutingRule["action"],
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toRoutingDecision(doc: Doc): RoutingDecision {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    queueSessionId: id(doc.queueSessionId),
    queueId: id(doc.queueId),
    agentId: id(doc.agentId),
    escalationQueueId: id(doc.escalationQueueId),
    status: doc.status as RoutingDecision["status"],
    reason: String(doc.reason),
    confidence: Number(doc.confidence),
    inputs: (doc.inputs as Record<string, unknown>) ?? {},
    decisionPath: (doc.decisionPath as string[] | undefined) ?? [],
    createdAt: date(doc.createdAt),
  };
}

export function toQueueSession(doc: Doc): QueueSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    queueId: id(doc.queueId) ?? "",
    callId: id(doc.callId),
    aiSessionId: id(doc.aiSessionId),
    leadId: id(doc.leadId),
    assignedAgentId: id(doc.assignedAgentId),
    priority: Number(doc.priority),
    status: doc.status as QueueSession["status"],
    source: doc.source as QueueSession["source"],
    routingReason: doc.routingReason ? String(doc.routingReason) : null,
    escalationPath: ((doc.escalationPath as unknown[] | undefined) ?? []).map((value) => id(value) ?? ""),
    enteredAt: date(doc.enteredAt),
    assignedAt: doc.assignedAt ? date(doc.assignedAt) : null,
    completedAt: doc.completedAt ? date(doc.completedAt) : null,
    abandonedAt: doc.abandonedAt ? date(doc.abandonedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentSkill(doc: Doc): AgentSkill {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentId: id(doc.agentId) ?? "",
    skill: String(doc.skill).toUpperCase(),
    level: Number(doc.level),
    certified: Boolean(doc.certified),
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

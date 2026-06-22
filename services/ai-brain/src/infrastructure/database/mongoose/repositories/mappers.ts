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
import type { AgentPerformance } from "../../../../domain/entities/agent-performance.js";
import type { CallOutcome } from "../../../../domain/entities/call-outcome.js";
import type { ConversationAnalytics } from "../../../../domain/entities/conversation-analytics.js";
import type { QualityScore } from "../../../../domain/entities/quality-score.js";
import type { QueueAnalytics } from "../../../../domain/entities/queue-analytics.js";
import type { SentimentAnalysis } from "../../../../domain/entities/sentiment-analysis.js";
import type { KnowledgeBase } from "../../../../domain/entities/knowledge-base.js";
import type { KnowledgeChunk } from "../../../../domain/entities/knowledge-chunk.js";
import type { KnowledgeCitation } from "../../../../domain/entities/knowledge-citation.js";
import type { KnowledgeDocument } from "../../../../domain/entities/knowledge-document.js";
import type { KnowledgeFeedback } from "../../../../domain/entities/knowledge-feedback.js";
import type { KnowledgeGap } from "../../../../domain/entities/knowledge-gap.js";
import type { KnowledgeImprovement } from "../../../../domain/entities/knowledge-improvement.js";
import type { KnowledgeLearningEvent } from "../../../../domain/entities/knowledge-learning-event.js";
import type { KnowledgeSearch } from "../../../../domain/entities/knowledge-search.js";
import type { KnowledgeSuggestion } from "../../../../domain/entities/knowledge-suggestion.js";
import type { AgentCollaborationDecision } from "../../../../domain/entities/agent-collaboration-decision.js";
import type { AgentCollaborationSession } from "../../../../domain/entities/agent-collaboration-session.js";
import type { AgentDelegation } from "../../../../domain/entities/agent-delegation.js";
import type { AgentTask } from "../../../../domain/entities/agent-task.js";
import type { AgentTeam } from "../../../../domain/entities/agent-team.js";
import type { AgentCoachingInsight } from "../../../../domain/entities/agent-coaching-insight.js";
import type { AgentCoachingSession } from "../../../../domain/entities/agent-coaching-session.js";
import type { AgentRecommendation } from "../../../../domain/entities/agent-recommendation.js";
import type { ComplianceAlert } from "../../../../domain/entities/compliance-alert.js";
import type { ConversationScorecard } from "../../../../domain/entities/conversation-scorecard.js";
import type { NextBestAction } from "../../../../domain/entities/next-best-action.js";
import type { CrossSellOpportunity } from "../../../../domain/entities/cross-sell-opportunity.js";
import type { DealRisk } from "../../../../domain/entities/deal-risk.js";
import type { DealStage } from "../../../../domain/entities/deal-stage.js";
import type { Opportunity } from "../../../../domain/entities/opportunity.js";
import type { RevenueForecast } from "../../../../domain/entities/revenue-forecast.js";
import type { SalesInsight } from "../../../../domain/entities/sales-insight.js";
import type { UpsellOpportunity } from "../../../../domain/entities/upsell-opportunity.js";
import type { WinLossAnalysis } from "../../../../domain/entities/win-loss-analysis.js";
import type { BenchmarkMetric } from "../../../../domain/entities/benchmark-metric.js";
import type { BusinessInsight } from "../../../../domain/entities/business-insight.js";
import type { ExecutiveDashboard } from "../../../../domain/entities/executive-dashboard.js";
import type { ExecutiveSummary } from "../../../../domain/entities/executive-summary.js";
import type { GeneratedReport } from "../../../../domain/entities/generated-report.js";
import type { KpiMetric } from "../../../../domain/entities/kpi-metric.js";
import type { ReportExport } from "../../../../domain/entities/report-export.js";
import type { ReportTemplate } from "../../../../domain/entities/report-template.js";
import type { ScheduledReport } from "../../../../domain/entities/scheduled-report.js";
import type { TrendAnalysis } from "../../../../domain/entities/trend-analysis.js";

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

export function toConversationAnalytics(doc: Doc): ConversationAnalytics {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    conversationId: id(doc.conversationId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    leadId: id(doc.leadId),
    callId: id(doc.callId),
    aiConfidence: Number(doc.aiConfidence),
    sentiment: doc.sentiment as ConversationAnalytics["sentiment"],
    sentimentScore: Number(doc.sentimentScore),
    qualityScore: Number(doc.qualityScore),
    outcome: (doc.outcome as ConversationAnalytics["outcome"]) ?? null,
    leadScore: Number(doc.leadScore),
    qualificationLevel: doc.qualificationLevel as ConversationAnalytics["qualificationLevel"],
    workflowSuccessRate: Number(doc.workflowSuccessRate),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentPerformance(doc: Doc): AgentPerformance {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentId: id(doc.agentId) ?? "",
    callsHandled: Number(doc.callsHandled),
    averageDuration: Number(doc.averageDuration),
    averageQaScore: Number(doc.averageQaScore),
    averageSentiment: Number(doc.averageSentiment),
    transfers: Number(doc.transfers),
    conversions: Number(doc.conversions),
    leadQuality: Number(doc.leadQuality),
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toQueueAnalytics(doc: Doc): QueueAnalytics {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    queueId: id(doc.queueId) ?? "",
    waitTime: Number(doc.waitTime),
    abandonmentRate: Number(doc.abandonmentRate),
    transferRate: Number(doc.transferRate),
    escalationRate: Number(doc.escalationRate),
    resolutionRate: Number(doc.resolutionRate),
    sessionsHandled: Number(doc.sessionsHandled),
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toCallOutcome(doc: Doc): CallOutcome {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    leadId: id(doc.leadId),
    callId: id(doc.callId),
    outcome: doc.outcome as CallOutcome["outcome"],
    confidence: Number(doc.confidence),
    reasoning: String(doc.reasoning),
    occurredAt: date(doc.occurredAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toQualityScore(doc: Doc): QualityScore {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    conversationId: id(doc.conversationId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    greetingQuality: Number(doc.greetingQuality),
    discoveryQuality: Number(doc.discoveryQuality),
    qualificationQuality: Number(doc.qualificationQuality),
    objectionHandling: Number(doc.objectionHandling),
    complianceScore: Number(doc.complianceScore),
    closingQuality: Number(doc.closingQuality),
    overallScore: Number(doc.overallScore),
    reasoning: String(doc.reasoning),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toSentimentAnalysis(doc: Doc): SentimentAnalysis {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    conversationId: id(doc.conversationId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    sentiment: doc.sentiment as SentimentAnalysis["sentiment"],
    score: Number(doc.score),
    confidence: Number(doc.confidence),
    reasoning: String(doc.reasoning),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeBase(doc: Doc): KnowledgeBase {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    description: doc.description ? String(doc.description) : null,
    active: Boolean(doc.active),
    createdBy: id(doc.createdBy),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeDocument(doc: Doc): KnowledgeDocument {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    knowledgeBaseId: id(doc.knowledgeBaseId) ?? "",
    title: String(doc.title),
    documentType: doc.documentType as KnowledgeDocument["documentType"],
    status: doc.status as KnowledgeDocument["status"],
    sourceName: String(doc.sourceName),
    contentHash: String(doc.contentHash),
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    error: doc.error ? String(doc.error) : null,
    chunkCount: Number(doc.chunkCount),
    uploadedBy: id(doc.uploadedBy),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeChunk(doc: Doc): KnowledgeChunk {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    knowledgeBaseId: id(doc.knowledgeBaseId) ?? "",
    documentId: id(doc.documentId) ?? "",
    chunkIndex: Number(doc.chunkIndex),
    content: String(doc.content),
    tokenCount: Number(doc.tokenCount),
    embedding: (doc.embedding as number[] | undefined) ?? [],
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeSearch(doc: Doc): KnowledgeSearch {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    query: String(doc.query),
    transcript: doc.transcript ? String(doc.transcript) : null,
    crmContext: (doc.crmContext as Record<string, unknown>) ?? {},
    memoryContext: (doc.memoryContext as Record<string, unknown>) ?? {},
    resultChunkIds: ((doc.resultChunkIds as unknown[] | undefined) ?? []).map((value) => id(value) ?? ""),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
  };
}

export function toKnowledgeCitation(doc: Doc): KnowledgeCitation {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    searchId: id(doc.searchId),
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    documentId: id(doc.documentId) ?? "",
    chunkId: id(doc.chunkId) ?? "",
    quote: String(doc.quote),
    relevanceScore: Number(doc.relevanceScore),
    createdAt: date(doc.createdAt),
  };
}

export function toKnowledgeFeedback(doc: Doc): KnowledgeFeedback {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    searchId: id(doc.searchId),
    citationId: id(doc.citationId),
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    chunkId: id(doc.chunkId),
    type: doc.type as KnowledgeFeedback["type"],
    retrievalUsage: doc.retrievalUsage as KnowledgeFeedback["retrievalUsage"],
    rating: doc.rating === null || doc.rating === undefined ? null : Number(doc.rating),
    comment: doc.comment ? String(doc.comment) : null,
    createdBy: id(doc.createdBy),
    createdAt: date(doc.createdAt),
  };
}

export function toKnowledgeGap(doc: Doc): KnowledgeGap {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    topic: String(doc.topic),
    description: String(doc.description),
    triggerCount: Number(doc.triggerCount),
    unansweredCount: Number(doc.unansweredCount),
    escalationCount: Number(doc.escalationCount),
    averageConfidence: Number(doc.averageConfidence),
    severityScore: Number(doc.severityScore),
    status: doc.status as KnowledgeGap["status"],
    sourceSearchIds: ((doc.sourceSearchIds as unknown[] | undefined) ?? []).map((value) => id(value) ?? ""),
    sourceConversationIds: ((doc.sourceConversationIds as unknown[] | undefined) ?? []).map((value) => id(value) ?? ""),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeSuggestion(doc: Doc): KnowledgeSuggestion {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    gapId: id(doc.gapId),
    type: doc.type as KnowledgeSuggestion["type"],
    title: String(doc.title),
    content: String(doc.content),
    rationale: String(doc.rationale),
    confidence: Number(doc.confidence),
    status: doc.status as KnowledgeSuggestion["status"],
    reviewedBy: id(doc.reviewedBy),
    reviewedAt: doc.reviewedAt ? date(doc.reviewedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKnowledgeLearningEvent(doc: Doc): KnowledgeLearningEvent {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    sourceConversationId: id(doc.sourceConversationId),
    sourceSessionId: id(doc.sourceSessionId),
    searchId: id(doc.searchId),
    topic: String(doc.topic),
    confidence: Number(doc.confidence),
    triggerReason: doc.triggerReason as KnowledgeLearningEvent["triggerReason"],
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: date(doc.createdAt),
  };
}

export function toKnowledgeImprovement(doc: Doc): KnowledgeImprovement {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    knowledgeQualityScore: Number(doc.knowledgeQualityScore),
    coverageScore: Number(doc.coverageScore),
    retrievalSuccessRate: Number(doc.retrievalSuccessRate),
    gapSeverityScore: Number(doc.gapSeverityScore),
    feedbackCount: Number(doc.feedbackCount),
    openGapCount: Number(doc.openGapCount),
    suggestionCount: Number(doc.suggestionCount),
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
  };
}

export function toAgentTeam(doc: Doc): AgentTeam {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    description: doc.description ? String(doc.description) : null,
    agents: (doc.agents as AgentTeam["agents"] | undefined) ?? [],
    objectives: (doc.objectives as string[] | undefined) ?? [],
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentTask(doc: Doc): AgentTask {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    collaborationSessionId: id(doc.collaborationSessionId),
    teamId: id(doc.teamId),
    assignedAgentId: id(doc.assignedAgentId),
    assignedAgentType: doc.assignedAgentType as AgentTask["assignedAgentType"],
    title: String(doc.title),
    description: String(doc.description),
    status: doc.status as AgentTask["status"],
    input: (doc.input as Record<string, unknown>) ?? {},
    output: (doc.output as Record<string, unknown>) ?? {},
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentDelegation(doc: Doc): AgentDelegation {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    collaborationSessionId: id(doc.collaborationSessionId),
    taskId: id(doc.taskId) ?? "",
    sourceAgentId: id(doc.sourceAgentId),
    targetAgentId: id(doc.targetAgentId),
    task: String(doc.task),
    status: doc.status as AgentDelegation["status"],
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentCollaborationSession(doc: Doc): AgentCollaborationSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    teamId: id(doc.teamId),
    conversationId: id(doc.conversationId),
    agentSessionId: id(doc.agentSessionId),
    primaryAgentId: id(doc.primaryAgentId),
    status: doc.status as AgentCollaborationSession["status"],
    customerRequest: String(doc.customerRequest),
    finalResponse: doc.finalResponse ? String(doc.finalResponse) : null,
    averageConfidence: Number(doc.averageConfidence),
    resolutionQuality: Number(doc.resolutionQuality),
    startedAt: date(doc.startedAt),
    completedAt: doc.completedAt ? date(doc.completedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentCollaborationDecision(doc: Doc): AgentCollaborationDecision {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    collaborationSessionId: id(doc.collaborationSessionId) ?? "",
    decisionType: doc.decisionType as AgentCollaborationDecision["decisionType"],
    agentId: id(doc.agentId),
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    approved: Boolean(doc.approved),
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: date(doc.createdAt),
  };
}

export function toAgentCoachingSession(doc: Doc): AgentCoachingSession {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentId: id(doc.agentId),
    humanSessionId: id(doc.humanSessionId),
    aiSessionId: id(doc.aiSessionId),
    callId: id(doc.callId),
    conversationId: id(doc.conversationId),
    status: doc.status as AgentCoachingSession["status"],
    startedAt: date(doc.startedAt),
    endedAt: doc.endedAt ? date(doc.endedAt) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toAgentCoachingInsight(doc: Doc): AgentCoachingInsight {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    coachingSessionId: id(doc.coachingSessionId),
    agentId: id(doc.agentId),
    conversationId: id(doc.conversationId),
    type: doc.type as AgentCoachingInsight["type"],
    message: String(doc.message),
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    accepted: doc.accepted === null || doc.accepted === undefined ? null : Boolean(doc.accepted),
    createdAt: date(doc.createdAt),
  };
}

export function toAgentRecommendation(doc: Doc): AgentRecommendation {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    coachingSessionId: id(doc.coachingSessionId),
    agentId: id(doc.agentId),
    conversationId: id(doc.conversationId),
    type: doc.type as AgentRecommendation["type"],
    title: String(doc.title),
    description: String(doc.description),
    priority: doc.priority as AgentRecommendation["priority"],
    used: Boolean(doc.used),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
  };
}

export function toComplianceAlert(doc: Doc): ComplianceAlert {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    coachingSessionId: id(doc.coachingSessionId),
    agentId: id(doc.agentId),
    conversationId: id(doc.conversationId),
    type: doc.type as ComplianceAlert["type"],
    severity: doc.severity as ComplianceAlert["severity"],
    message: String(doc.message),
    resolved: Boolean(doc.resolved),
    createdAt: date(doc.createdAt),
  };
}

export function toConversationScorecard(doc: Doc): ConversationScorecard {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    coachingSessionId: id(doc.coachingSessionId),
    agentId: id(doc.agentId),
    conversationId: id(doc.conversationId),
    discoveryQuality: Number(doc.discoveryQuality),
    qualificationQuality: Number(doc.qualificationQuality),
    objectionHandlingQuality: Number(doc.objectionHandlingQuality),
    complianceScore: Number(doc.complianceScore),
    closingEffectiveness: Number(doc.closingEffectiveness),
    overallScore: Number(doc.overallScore),
    reasoning: String(doc.reasoning),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toNextBestAction(doc: Doc): NextBestAction {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    coachingSessionId: id(doc.coachingSessionId),
    agentId: id(doc.agentId),
    conversationId: id(doc.conversationId),
    actionType: doc.actionType as NextBestAction["actionType"],
    label: String(doc.label),
    rationale: String(doc.rationale),
    priority: doc.priority as NextBestAction["priority"],
    completed: Boolean(doc.completed),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
  };
}

export function toOpportunity(doc: Doc): Opportunity {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    leadId: id(doc.leadId),
    crmContactId: doc.crmContactId === null || doc.crmContactId === undefined ? null : String(doc.crmContactId),
    crmDealId: doc.crmDealId === null || doc.crmDealId === undefined ? null : String(doc.crmDealId),
    name: String(doc.name),
    value: Number(doc.value),
    probability: Number(doc.probability),
    expectedCloseDate: doc.expectedCloseDate ? date(doc.expectedCloseDate) : null,
    stageId: id(doc.stageId),
    stageName: String(doc.stageName),
    source: String(doc.source),
    ownerId: id(doc.ownerId),
    aiScore: Number(doc.aiScore),
    status: doc.status as Opportunity["status"],
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toDealStage(doc: Doc): DealStage {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    order: Number(doc.order),
    probability: Number(doc.probability),
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toRevenueForecast(doc: Doc): RevenueForecast {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    period: doc.period as RevenueForecast["period"],
    periodStart: date(doc.periodStart),
    periodEnd: date(doc.periodEnd),
    pipelineValue: Number(doc.pipelineValue),
    weightedRevenue: Number(doc.weightedRevenue),
    committedRevenue: Number(doc.committedRevenue),
    projectedRevenue: Number(doc.projectedRevenue),
    opportunityCount: Number(doc.opportunityCount),
    confidence: Number(doc.confidence),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toDealRisk(doc: Doc): DealRisk {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    opportunityId: id(doc.opportunityId) ?? "",
    riskType: doc.riskType as DealRisk["riskType"],
    riskScore: Number(doc.riskScore),
    reasons: Array.isArray(doc.reasons) ? doc.reasons.map(String) : [],
    recommendedActions: Array.isArray(doc.recommendedActions) ? doc.recommendedActions.map(String) : [],
    active: Boolean(doc.active),
    detectedAt: date(doc.detectedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toWinLossAnalysis(doc: Doc): WinLossAnalysis {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    opportunityId: id(doc.opportunityId) ?? "",
    outcome: doc.outcome as WinLossAnalysis["outcome"],
    reason: String(doc.reason),
    competitors: Array.isArray(doc.competitors) ? doc.competitors.map(String) : [],
    successFactors: Array.isArray(doc.successFactors) ? doc.successFactors.map(String) : [],
    failureFactors: Array.isArray(doc.failureFactors) ? doc.failureFactors.map(String) : [],
    improvementSuggestions: Array.isArray(doc.improvementSuggestions) ? doc.improvementSuggestions.map(String) : [],
    analyzedAt: date(doc.analyzedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toSalesInsight(doc: Doc): SalesInsight {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    type: doc.type as SalesInsight["type"],
    title: String(doc.title),
    message: String(doc.message),
    value: Number(doc.value),
    trend: doc.trend as SalesInsight["trend"],
    confidence: Number(doc.confidence),
    metadata: doc.metadata && typeof doc.metadata === "object" && !Array.isArray(doc.metadata) ? doc.metadata as Record<string, unknown> : {},
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toUpsellOpportunity(doc: Doc): UpsellOpportunity {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    customerId: id(doc.customerId),
    opportunityId: id(doc.opportunityId),
    product: String(doc.product),
    estimatedValue: Number(doc.estimatedValue),
    fitScore: Number(doc.fitScore),
    reasons: Array.isArray(doc.reasons) ? doc.reasons.map(String) : [],
    recommendedActions: Array.isArray(doc.recommendedActions) ? doc.recommendedActions.map(String) : [],
    status: doc.status as UpsellOpportunity["status"],
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toCrossSellOpportunity(doc: Doc): CrossSellOpportunity {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    customerId: id(doc.customerId),
    opportunityId: id(doc.opportunityId),
    product: String(doc.product),
    affinityScore: Number(doc.affinityScore),
    estimatedValue: Number(doc.estimatedValue),
    complementaryServices: Array.isArray(doc.complementaryServices) ? doc.complementaryServices.map(String) : [],
    reasons: Array.isArray(doc.reasons) ? doc.reasons.map(String) : [],
    status: doc.status as CrossSellOpportunity["status"],
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function toReportTemplate(doc: Doc): ReportTemplate {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    name: String(doc.name),
    description: doc.description === null || doc.description === undefined ? null : String(doc.description),
    type: doc.type as ReportTemplate["type"],
    sections: Array.isArray(doc.sections) ? doc.sections.map(String) : [],
    filters: record(doc.filters),
    active: Boolean(doc.active),
    createdBy: id(doc.createdBy),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toScheduledReport(doc: Doc): ScheduledReport {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    templateId: id(doc.templateId),
    name: String(doc.name),
    frequency: doc.frequency as ScheduledReport["frequency"],
    recipients: Array.isArray(doc.recipients) ? doc.recipients.map(String) : [],
    nextRunAt: date(doc.nextRunAt),
    lastRunAt: doc.lastRunAt ? date(doc.lastRunAt) : null,
    active: Boolean(doc.active),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toGeneratedReport(doc: Doc): GeneratedReport {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    templateId: id(doc.templateId),
    scheduledReportId: id(doc.scheduledReportId),
    title: String(doc.title),
    status: doc.status as GeneratedReport["status"],
    summary: String(doc.summary),
    data: record(doc.data),
    generatedAt: date(doc.generatedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toExecutiveDashboard(doc: Doc): ExecutiveDashboard {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    revenueOverview: record(doc.revenueOverview),
    salesOverview: record(doc.salesOverview),
    coachingOverview: record(doc.coachingOverview),
    knowledgeOverview: record(doc.knowledgeOverview),
    agentOverview: record(doc.agentOverview),
    aiPerformanceOverview: record(doc.aiPerformanceOverview),
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toKpiMetric(doc: Doc): KpiMetric {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    category: doc.category as KpiMetric["category"],
    name: String(doc.name),
    value: Number(doc.value),
    target: doc.target === null || doc.target === undefined ? null : Number(doc.target),
    unit: String(doc.unit),
    trend: doc.trend as KpiMetric["trend"],
    period: doc.period as KpiMetric["period"],
    measuredAt: date(doc.measuredAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toTrendAnalysis(doc: Doc): TrendAnalysis {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    metric: String(doc.metric),
    period: doc.period as TrendAnalysis["period"],
    values: Array.isArray(doc.values) ? doc.values.map((item) => record(item) as { label: string; value: number }) : [],
    changePercent: Number(doc.changePercent),
    direction: doc.direction as TrendAnalysis["direction"],
    insight: String(doc.insight),
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toBenchmarkMetric(doc: Doc): BenchmarkMetric {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    scope: doc.scope as BenchmarkMetric["scope"],
    metric: String(doc.metric),
    value: Number(doc.value),
    benchmarkValue: Number(doc.benchmarkValue),
    percentile: Number(doc.percentile),
    comparison: doc.comparison as BenchmarkMetric["comparison"],
    computedAt: date(doc.computedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toBusinessInsight(doc: Doc): BusinessInsight {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    type: doc.type as BusinessInsight["type"],
    title: String(doc.title),
    message: String(doc.message),
    impactScore: Number(doc.impactScore),
    recommendedActions: Array.isArray(doc.recommendedActions) ? doc.recommendedActions.map(String) : [],
    metadata: record(doc.metadata),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toExecutiveSummary(doc: Doc): ExecutiveSummary {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    title: String(doc.title),
    summary: String(doc.summary),
    highlights: Array.isArray(doc.highlights) ? doc.highlights.map(String) : [],
    risks: Array.isArray(doc.risks) ? doc.risks.map(String) : [],
    recommendations: Array.isArray(doc.recommendations) ? doc.recommendations.map(String) : [],
    sourceSections: Array.isArray(doc.sourceSections) ? doc.sourceSections.map(String) : [],
    generatedAt: date(doc.generatedAt),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toReportExport(doc: Doc): ReportExport {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    reportId: id(doc.reportId),
    format: doc.format as ReportExport["format"],
    status: doc.status as ReportExport["status"],
    fileName: String(doc.fileName),
    downloadUrl: doc.downloadUrl === null || doc.downloadUrl === undefined ? null : String(doc.downloadUrl),
    requestedBy: id(doc.requestedBy),
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

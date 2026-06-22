import type { AgentDecision } from "../domain/entities/agent-decision.js";
import type { AgentPersona } from "../domain/entities/agent-persona.js";
import type { AgentSession } from "../domain/entities/agent-session.js";
import type { AIConversation } from "../domain/entities/ai-conversation.js";
import type { AIMessage } from "../domain/entities/ai-message.js";
import type { ConversationState } from "../domain/entities/conversation-state.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../domain/entities/tool-execution.js";
import type { ActionAudit } from "../domain/entities/action-audit.js";
import type { ScheduledFollowup } from "../domain/entities/scheduled-followup.js";
import type { WorkflowAction } from "../domain/entities/workflow-action.js";
import type { WorkflowExecution } from "../domain/entities/workflow-execution.js";
import type { Agent } from "../domain/entities/agent.js";
import type { AgentAvailability } from "../domain/entities/agent-availability.js";
import type { HumanAgentSession } from "../domain/entities/human-agent-session.js";
import type { LiveTakeover } from "../domain/entities/live-takeover.js";
import type { SupervisorSession } from "../domain/entities/supervisor-session.js";
import type { WhisperMessage } from "../domain/entities/whisper-message.js";
import type { AgentSkill } from "../domain/entities/agent-skill.js";
import type { Queue } from "../domain/entities/queue.js";
import type { QueueMember } from "../domain/entities/queue-member.js";
import type { QueueSession } from "../domain/entities/queue-session.js";
import type { RoutingDecision } from "../domain/entities/routing-decision.js";
import type { RoutingRule } from "../domain/entities/routing-rule.js";
import type { AgentPerformance } from "../domain/entities/agent-performance.js";
import type { CallOutcome } from "../domain/entities/call-outcome.js";
import type { ConversationAnalytics } from "../domain/entities/conversation-analytics.js";
import type { QualityScore } from "../domain/entities/quality-score.js";
import type { QueueAnalytics } from "../domain/entities/queue-analytics.js";
import type { SentimentAnalysis } from "../domain/entities/sentiment-analysis.js";
import type { KnowledgeBase } from "../domain/entities/knowledge-base.js";
import type { KnowledgeChunk } from "../domain/entities/knowledge-chunk.js";
import type { KnowledgeCitation } from "../domain/entities/knowledge-citation.js";
import type { KnowledgeDocument } from "../domain/entities/knowledge-document.js";
import type { KnowledgeFeedback } from "../domain/entities/knowledge-feedback.js";
import type { KnowledgeGap } from "../domain/entities/knowledge-gap.js";
import type { KnowledgeImprovement } from "../domain/entities/knowledge-improvement.js";
import type { KnowledgeLearningEvent } from "../domain/entities/knowledge-learning-event.js";
import type { KnowledgeSearch } from "../domain/entities/knowledge-search.js";
import type { KnowledgeSuggestion } from "../domain/entities/knowledge-suggestion.js";

export const toConversationDto = (value: AIConversation) => ({ ...value, startedAt: iso(value.startedAt), endedAt: maybeIso(value.endedAt), createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toMessageDto = (value: AIMessage) => ({ ...value, timestamp: iso(value.timestamp) });
export const toToolExecutionDto = (value: ToolExecution) => ({ ...value, executedAt: iso(value.executedAt) });
export const toQualificationDto = (value: LeadQualification) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toAgentSessionDto = (value: AgentSession) => ({
  ...value,
  startedAt: iso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  lastTranscriptAt: maybeIso(value.lastTranscriptAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toAgentPersonaDto = (value: AgentPersona) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toConversationStateDto = (value: ConversationState) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toAgentDecisionDto = (value: AgentDecision) => ({ ...value, createdAt: iso(value.createdAt) });
export const toWorkflowExecutionDto = (value: WorkflowExecution) => ({
  ...value,
  startedAt: iso(value.startedAt),
  completedAt: maybeIso(value.completedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toWorkflowActionDto = (value: WorkflowAction) => ({
  ...value,
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toScheduledFollowupDto = (value: ScheduledFollowup) => ({
  ...value,
  followupDate: iso(value.followupDate),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
  completedAt: maybeIso(value.completedAt),
});
export const toActionAuditDto = (value: ActionAudit) => ({ ...value, createdAt: iso(value.createdAt) });
export const toHumanAgentDto = (value: Agent) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentAvailabilityDto = (value: AgentAvailability) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toHumanAgentSessionDto = (value: HumanAgentSession) => ({
  ...value,
  joinedAt: iso(value.joinedAt),
  leftAt: maybeIso(value.leftAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toLiveTakeoverDto = (value: LiveTakeover) => ({
  ...value,
  requestedAt: iso(value.requestedAt),
  approvedAt: maybeIso(value.approvedAt),
  startedAt: maybeIso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  returnedToAiAt: maybeIso(value.returnedToAiAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toWhisperMessageDto = (value: WhisperMessage) => ({ ...value, createdAt: iso(value.createdAt) });
export const toSupervisorSessionDto = (value: SupervisorSession) => ({
  ...value,
  startedAt: iso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQueueDto = (value: Queue) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toQueueMemberDto = (value: QueueMember) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toRoutingRuleDto = (value: RoutingRule) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toRoutingDecisionDto = (value: RoutingDecision) => ({ ...value, createdAt: iso(value.createdAt) });
export const toQueueSessionDto = (value: QueueSession) => ({
  ...value,
  enteredAt: iso(value.enteredAt),
  assignedAt: maybeIso(value.assignedAt),
  completedAt: maybeIso(value.completedAt),
  abandonedAt: maybeIso(value.abandonedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toAgentSkillDto = (value: AgentSkill) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toConversationAnalyticsDto = (value: ConversationAnalytics) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentPerformanceDto = (value: AgentPerformance) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQueueAnalyticsDto = (value: QueueAnalytics) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toCallOutcomeDto = (value: CallOutcome) => ({
  ...value,
  occurredAt: iso(value.occurredAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQualityScoreDto = (value: QualityScore) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toSentimentAnalysisDto = (value: SentimentAnalysis) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeBaseDto = (value: KnowledgeBase) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeDocumentDto = (value: KnowledgeDocument) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeChunkDto = (value: KnowledgeChunk) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeSearchDto = (value: KnowledgeSearch) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeCitationDto = (value: KnowledgeCitation) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeFeedbackDto = (value: KnowledgeFeedback) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeGapDto = (value: KnowledgeGap) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeSuggestionDto = (value: KnowledgeSuggestion) => ({
  ...value,
  reviewedAt: maybeIso(value.reviewedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toKnowledgeLearningEventDto = (value: KnowledgeLearningEvent) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeImprovementDto = (value: KnowledgeImprovement) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
});

function iso(date: Date): string {
  return date.toISOString();
}

function maybeIso(date: Date | null): string | null {
  return date ? iso(date) : null;
}

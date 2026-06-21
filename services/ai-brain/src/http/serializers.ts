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

function iso(date: Date): string {
  return date.toISOString();
}

function maybeIso(date: Date | null): string | null {
  return date ? iso(date) : null;
}

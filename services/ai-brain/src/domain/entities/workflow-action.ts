export const workflowActionTypes = [
  "CREATE_NOTE",
  "CREATE_ACTIVITY",
  "UPDATE_LEAD",
  "UPDATE_CONTACT",
  "ADD_MEMORY",
  "UPDATE_PREFERENCE",
  "CREATE_TIMELINE_EVENT",
  "SCHEDULE_FOLLOWUP",
  "TRIGGER_HANDOFF",
  "NO_ACTION",
] as const;

export type WorkflowActionType = (typeof workflowActionTypes)[number];
export type WorkflowActionStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "SKIPPED";

export interface WorkflowAction {
  id: string;
  organizationId: string;
  workflowExecutionId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string | null;
  actionType: WorkflowActionType;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: WorkflowActionStatus;
  reasoning: string;
  confidence: number;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

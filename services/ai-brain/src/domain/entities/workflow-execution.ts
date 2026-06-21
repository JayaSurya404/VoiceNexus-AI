import type { WorkflowActionType } from "./workflow-action.js";

export type WorkflowExecutionStatus = "PLANNED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";

export interface WorkflowExecution {
  id: string;
  organizationId: string;
  agentSessionId: string;
  conversationId: string | null;
  leadId: string | null;
  trigger: "TRANSCRIPT_FINAL" | "MANUAL" | "SYSTEM";
  status: WorkflowExecutionStatus;
  plannedActions: WorkflowActionType[];
  completedActions: number;
  failedActions: number;
  reasoning: string;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

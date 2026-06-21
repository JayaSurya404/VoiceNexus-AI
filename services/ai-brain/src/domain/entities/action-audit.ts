import type { WorkflowActionType } from "./workflow-action.js";

export type ActionAuditStatus = "SUCCESS" | "FAILED" | "SKIPPED";

export interface ActionAudit {
  id: string;
  organizationId: string;
  sessionId: string | null;
  conversationId: string | null;
  workflowExecutionId: string | null;
  workflowActionId: string | null;
  actionType: WorkflowActionType;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: ActionAuditStatus;
  reasoning: string;
  confidence: number;
  createdAt: Date;
}

import type { ConversationStateName } from "./conversation-state.js";

export type AgentDecisionType =
  | "STATE_TRANSITION"
  | "QUALIFICATION"
  | "OBJECTION"
  | "FOLLOWUP"
  | "HANDOFF"
  | "TOOL_CALL"
  | "RESPONSE";

export interface AgentDecision {
  id: string;
  organizationId: string;
  agentSessionId: string;
  aiConversationId: string | null;
  type: AgentDecisionType;
  state: ConversationStateName;
  decision: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

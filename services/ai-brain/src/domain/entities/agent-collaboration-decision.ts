export type CollaborationDecisionType =
  | "DELEGATION"
  | "SPECIALIST_RESULT"
  | "SUPERVISOR_REVIEW"
  | "CONFLICT_RESOLUTION"
  | "FINAL_APPROVAL";

export interface AgentCollaborationDecision {
  id: string;
  organizationId: string;
  collaborationSessionId: string;
  decisionType: CollaborationDecisionType;
  agentId: string | null;
  reasoning: string;
  confidence: number;
  approved: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

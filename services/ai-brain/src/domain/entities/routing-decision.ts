export type RoutingDecisionStatus = "COMPLETED" | "FAILED";

export interface RoutingDecision {
  id: string;
  organizationId: string;
  queueSessionId: string | null;
  queueId: string | null;
  agentId: string | null;
  escalationQueueId: string | null;
  status: RoutingDecisionStatus;
  reason: string;
  confidence: number;
  inputs: Record<string, unknown>;
  decisionPath: string[];
  createdAt: Date;
}

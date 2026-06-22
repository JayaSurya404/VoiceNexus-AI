export type RoutingRuleAction = "ASSIGN_QUEUE" | "ESCALATE_QUEUE" | "ESCALATE_SUPERVISOR";

export interface RoutingRule {
  id: string;
  organizationId: string;
  name: string;
  priority: number;
  requiredSkills: string[];
  conditions: Record<string, unknown>;
  targetQueueId: string | null;
  escalationQueueId: string | null;
  action: RoutingRuleAction;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

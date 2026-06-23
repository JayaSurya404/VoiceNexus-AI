export type UsageRecordMetric =
  | "calls"
  | "messages"
  | "ai_requests"
  | "tokens"
  | "storage_gb"
  | "workflow_executions"
  | "minutes";

export interface UsageRecord {
  id: string;
  organizationId: string;
  metric: UsageRecordMetric;
  quantity: number;
  unit: string;
  source: string;
  occurredAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

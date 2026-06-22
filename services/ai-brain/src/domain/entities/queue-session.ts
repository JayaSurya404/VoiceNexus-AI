export type QueueSessionStatus = "WAITING" | "ASSIGNED" | "TRANSFERRED" | "COMPLETED" | "ABANDONED";
export type QueueSessionSource = "AI" | "AGENT" | "QUEUE" | "MANUAL";

export interface QueueSession {
  id: string;
  organizationId: string;
  queueId: string;
  callId: string | null;
  aiSessionId: string | null;
  leadId: string | null;
  assignedAgentId: string | null;
  priority: number;
  status: QueueSessionStatus;
  source: QueueSessionSource;
  routingReason: string | null;
  escalationPath: string[];
  enteredAt: Date;
  assignedAt: Date | null;
  completedAt: Date | null;
  abandonedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

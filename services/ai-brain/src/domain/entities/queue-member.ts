export type QueueMemberRole = "AGENT" | "SUPERVISOR";

export interface QueueMember {
  id: string;
  organizationId: string;
  queueId: string;
  agentId: string;
  role: QueueMemberRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

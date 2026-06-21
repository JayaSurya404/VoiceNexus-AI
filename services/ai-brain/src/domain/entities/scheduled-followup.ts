export type ScheduledFollowupStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type ScheduledFollowupPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ScheduledFollowup {
  id: string;
  organizationId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string;
  assignedTo: string | null;
  followupDate: Date;
  reason: string;
  priority: ScheduledFollowupPriority;
  status: ScheduledFollowupStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

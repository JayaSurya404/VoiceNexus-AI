export type LiveTakeoverStatus = "REQUESTED" | "APPROVED" | "ACTIVE" | "ENDED" | "REJECTED";

export interface LiveTakeover {
  id: string;
  organizationId: string;
  sessionId: string;
  agentId: string;
  supervisorId: string | null;
  status: LiveTakeoverStatus;
  reason: string;
  requestedAt: Date;
  approvedAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  returnedToAiAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

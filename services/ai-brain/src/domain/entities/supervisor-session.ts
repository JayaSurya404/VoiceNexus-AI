export type SupervisorSessionStatus = "ACTIVE" | "ENDED";

export interface SupervisorSession {
  id: string;
  organizationId: string;
  supervisorId: string;
  status: SupervisorSessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  watchedSessionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

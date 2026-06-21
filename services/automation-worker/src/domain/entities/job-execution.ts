export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "RETRYING" | "CANCELLED";
export type JobType = "FOLLOWUP" | "WORKFLOW_ACTION" | "WORKFLOW";

export interface JobExecution {
  id: string;
  organizationId: string;
  jobScheduleId: string;
  workerId: string;
  jobType: JobType;
  status: JobStatus;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date | null;
  executionTimeMs: number | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

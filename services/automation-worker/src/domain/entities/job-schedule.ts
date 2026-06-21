import type { JobStatus, JobType } from "./job-execution.js";

export interface JobSchedule {
  id: string;
  organizationId: string;
  jobType: JobType;
  sourceType: "SCHEDULED_FOLLOWUP" | "WORKFLOW_ACTION" | "WORKFLOW_EXECUTION";
  sourceId: string;
  status: JobStatus;
  runAt: Date;
  maxRetries: number;
  retryDelaySeconds: number;
  attemptCount: number;
  lastError: string | null;
  lockedAt: Date | null;
  lockedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

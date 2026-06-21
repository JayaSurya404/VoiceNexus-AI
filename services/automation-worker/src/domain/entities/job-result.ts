export interface JobResult {
  id: string;
  organizationId: string;
  jobExecutionId: string;
  jobScheduleId: string;
  success: boolean;
  output: Record<string, unknown>;
  error: string | null;
  createdAt: Date;
}

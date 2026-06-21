import { env } from "../../config/env.js";
import type { JobScheduleRepository, SharedWorkflowRepository } from "../ports.js";

export class JobSchedulerService {
  constructor(
    private readonly schedules: JobScheduleRepository,
    private readonly sharedWorkflow: SharedWorkflowRepository,
  ) {}

  async seedDueSchedules(now = new Date()): Promise<void> {
    const [followups, workflowActions] = await Promise.all([
      this.sharedWorkflow.findDueFollowups(now, env.WORKER_BATCH_SIZE),
      this.sharedWorkflow.findRetryableWorkflowActions(env.WORKER_BATCH_SIZE),
    ]);

    await Promise.all([
      ...followups.map((followup) =>
        this.schedules.ensure({
          organizationId: followup.organizationId,
          jobType: "FOLLOWUP",
          sourceType: "SCHEDULED_FOLLOWUP",
          sourceId: followup.id,
          status: "PENDING",
          runAt: followup.followupDate,
          maxRetries: env.WORKER_MAX_RETRIES,
          retryDelaySeconds: 30,
          attemptCount: 0,
          lastError: null,
          lockedAt: null,
          lockedBy: null,
        }),
      ),
      ...workflowActions.map((action) =>
        this.schedules.ensure({
          organizationId: action.organizationId,
          jobType: "WORKFLOW_ACTION",
          sourceType: "WORKFLOW_ACTION",
          sourceId: action.id,
          status: "PENDING",
          runAt: now,
          maxRetries: env.WORKER_MAX_RETRIES,
          retryDelaySeconds: 30,
          attemptCount: 0,
          lastError: null,
          lockedAt: null,
          lockedBy: null,
        }),
      ),
    ]);
  }

  findDueSchedules(now = new Date()) {
    return this.schedules.findDue(now, env.WORKER_BATCH_SIZE);
  }
}

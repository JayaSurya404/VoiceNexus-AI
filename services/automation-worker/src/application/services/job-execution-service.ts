import { env } from "../../config/env.js";
import type { JobSchedule } from "../../domain/entities/job-schedule.js";
import type { JobExecutionRepository, JobResultRepository, JobScheduleRepository, WorkerActionRepository } from "../ports.js";
import { JobDispatcherService } from "./job-dispatcher-service.js";
import { RetryService } from "./retry-service.js";

export class JobExecutionService {
  constructor(
    private readonly schedules: JobScheduleRepository,
    private readonly executions: JobExecutionRepository,
    private readonly results: JobResultRepository,
    private readonly dispatcher: JobDispatcherService,
    private readonly retry: RetryService,
    private readonly actionAudit: WorkerActionRepository,
  ) {}

  async execute(schedule: JobSchedule): Promise<void> {
    const running = await this.schedules.markRunning(schedule.id, env.WORKER_ID);
    if (!running) return;

    const startedAt = new Date();
    const execution = await this.executions.create({
      organizationId: running.organizationId,
      jobScheduleId: running.id,
      workerId: env.WORKER_ID,
      jobType: running.jobType,
      status: "RUNNING",
      attemptNumber: running.attemptCount,
      startedAt,
      completedAt: null,
      executionTimeMs: null,
      error: null,
    });

    try {
      const output = await this.dispatcher.dispatch(running);
      const completedAt = new Date();
      const executionTimeMs = completedAt.getTime() - startedAt.getTime();
      await this.executions.update(execution.id, { status: "COMPLETED", completedAt, executionTimeMs, error: null });
      await this.schedules.update(running.id, {
        status: "COMPLETED",
        lockedAt: null,
        lockedBy: null,
        lastError: null,
      });
      await this.results.create({
        organizationId: running.organizationId,
        jobExecutionId: execution.id,
        jobScheduleId: running.id,
        success: true,
        output,
        error: null,
        createdAt: completedAt,
      });
      await this.audit(running, execution.id, running.attemptCount, executionTimeMs, "SUCCESS", output);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job failed";
      const completedAt = new Date();
      const executionTimeMs = completedAt.getTime() - startedAt.getTime();
      const retry = this.retry.nextRetry({ attemptCount: running.attemptCount, maxRetries: running.maxRetries });
      await this.executions.update(execution.id, {
        status: retry.shouldRetry ? "RETRYING" : "FAILED",
        completedAt,
        executionTimeMs,
        error: message,
      });
      await this.schedules.update(running.id, {
        status: retry.shouldRetry ? "RETRYING" : "FAILED",
        runAt: new Date(Date.now() + retry.delaySeconds * 1000),
        retryDelaySeconds: retry.delaySeconds,
        lockedAt: null,
        lockedBy: null,
        lastError: message,
      });
      await this.results.create({
        organizationId: running.organizationId,
        jobExecutionId: execution.id,
        jobScheduleId: running.id,
        success: false,
        output: {},
        error: message,
        createdAt: completedAt,
      });
      await this.audit(running, execution.id, running.attemptCount, executionTimeMs, "FAILED", { error: message });
    }
  }

  private audit(
    schedule: JobSchedule,
    jobId: string,
    attemptNumber: number,
    executionTimeMs: number,
    status: "SUCCESS" | "FAILED" | "SKIPPED",
    output: Record<string, unknown>,
  ) {
    return this.actionAudit.createAudit({
      organizationId: schedule.organizationId,
      sessionId: null,
      conversationId: null,
      workflowExecutionId: schedule.sourceType === "WORKFLOW_EXECUTION" ? schedule.sourceId : null,
      workflowActionId: schedule.sourceType === "WORKFLOW_ACTION" ? schedule.sourceId : null,
      actionType: schedule.jobType === "FOLLOWUP" ? "SCHEDULE_FOLLOWUP" : "CREATE_ACTIVITY",
      toolName: `automationWorker.${schedule.jobType}`,
      input: { scheduleId: schedule.id, sourceType: schedule.sourceType, sourceId: schedule.sourceId },
      output,
      status,
      reasoning: "Automation worker processed a scheduled background job.",
      confidence: status === "SUCCESS" ? 1 : 0,
      workerId: env.WORKER_ID,
      jobId,
      attemptNumber,
      executionTimeMs,
    });
  }
}

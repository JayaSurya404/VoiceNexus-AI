import type { JobExecution, JobStatus, JobType } from "../domain/entities/job-execution.js";
import type { JobResult } from "../domain/entities/job-result.js";
import type { JobSchedule } from "../domain/entities/job-schedule.js";

export interface JobScheduleRepository {
  create(input: Omit<JobSchedule, "id" | "createdAt" | "updatedAt">): Promise<JobSchedule>;
  ensure(input: Omit<JobSchedule, "id" | "createdAt" | "updatedAt">): Promise<JobSchedule | null>;
  findDue(now: Date, limit: number): Promise<JobSchedule[]>;
  findById(id: string): Promise<JobSchedule | null>;
  listByStatus(statuses: JobStatus[], limit: number): Promise<JobSchedule[]>;
  markRunning(id: string, workerId: string): Promise<JobSchedule | null>;
  update(id: string, input: Partial<Pick<JobSchedule, "status" | "attemptCount" | "runAt" | "lastError" | "lockedAt" | "lockedBy" | "retryDelaySeconds">>): Promise<JobSchedule | null>;
}

export interface JobExecutionRepository {
  create(input: Omit<JobExecution, "id" | "createdAt" | "updatedAt">): Promise<JobExecution>;
  findById(id: string): Promise<JobExecution | null>;
  listBySchedule(jobScheduleId: string): Promise<JobExecution[]>;
  update(id: string, input: Partial<Pick<JobExecution, "status" | "completedAt" | "executionTimeMs" | "error">>): Promise<JobExecution | null>;
}

export interface JobResultRepository {
  create(input: Omit<JobResult, "id">): Promise<JobResult>;
  listByExecution(jobExecutionId: string): Promise<JobResult[]>;
  listBySchedule(jobScheduleId: string): Promise<JobResult[]>;
}

export interface FollowupWorkItem {
  id: string;
  organizationId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string;
  followupDate: Date;
  reason: string;
  priority: string;
  status: string;
}

export interface WorkflowActionWorkItem {
  id: string;
  organizationId: string;
  workflowExecutionId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string | null;
  actionType: string;
  toolName: string;
  input: Record<string, unknown>;
  reasoning: string;
  confidence: number;
  status: string;
}

export interface SharedWorkflowRepository {
  findDueFollowups(now: Date, limit: number): Promise<FollowupWorkItem[]>;
  findRetryableWorkflowActions(limit: number): Promise<WorkflowActionWorkItem[]>;
  completeFollowup(id: string, organizationId: string): Promise<void>;
  updateWorkflowAction(id: string, input: { status: string; output?: Record<string, unknown>; error?: string | null }): Promise<void>;
  updateWorkflowExecutionFromActions(workflowExecutionId: string): Promise<void>;
}

export interface WorkerActionRepository {
  createCrmActivity(input: TenantLeadInput & { type: string; title: string; description: string }): Promise<Record<string, unknown>>;
  createNote(input: TenantLeadInput & { content: string }): Promise<Record<string, unknown>>;
  updateLead(input: TenantLeadInput & { update: Record<string, unknown> }): Promise<Record<string, unknown>>;
  createTimelineEvent(input: TenantLeadInput & { eventType: string; title: string; description: string; metadata?: Record<string, unknown> }): Promise<Record<string, unknown>>;
  createAudit(input: {
    organizationId: string;
    sessionId: string | null;
    conversationId: string | null;
    workflowExecutionId: string | null;
    workflowActionId: string | null;
    actionType: string;
    toolName: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    status: "SUCCESS" | "FAILED" | "SKIPPED";
    reasoning: string;
    confidence: number;
    workerId: string;
    jobId: string;
    attemptNumber: number;
    executionTimeMs: number;
  }): Promise<void>;
}

export interface TenantLeadInput {
  organizationId: string;
  leadId: string;
}

export interface WorkerMetrics {
  jobsExecuted: number;
  successRate: number;
  failureRate: number;
  averageRuntimeMs: number;
  retries: number;
}

export interface JobScheduleInput {
  organizationId: string;
  jobType: JobType;
  sourceType: JobSchedule["sourceType"];
  sourceId: string;
  runAt: Date;
}

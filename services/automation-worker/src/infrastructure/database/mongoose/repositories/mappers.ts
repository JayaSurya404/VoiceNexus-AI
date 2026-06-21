import type { JobExecution } from "../../../../domain/entities/job-execution.js";
import type { JobResult } from "../../../../domain/entities/job-result.js";
import type { JobSchedule } from "../../../../domain/entities/job-schedule.js";
import type { FollowupWorkItem, WorkflowActionWorkItem } from "../../../../application/ports.js";

type Doc = Record<string, unknown> & { _id: { toString(): string } };

const id = (value: unknown): string | null => (value && typeof value === "object" && "toString" in value ? String(value) : null);
const date = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));

export function toJobSchedule(doc: Doc): JobSchedule {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    jobType: doc.jobType as JobSchedule["jobType"],
    sourceType: doc.sourceType as JobSchedule["sourceType"],
    sourceId: id(doc.sourceId) ?? "",
    status: doc.status as JobSchedule["status"],
    runAt: date(doc.runAt),
    maxRetries: Number(doc.maxRetries),
    retryDelaySeconds: Number(doc.retryDelaySeconds),
    attemptCount: Number(doc.attemptCount),
    lastError: doc.lastError ? String(doc.lastError) : null,
    lockedAt: doc.lockedAt ? date(doc.lockedAt) : null,
    lockedBy: doc.lockedBy ? String(doc.lockedBy) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toJobExecution(doc: Doc): JobExecution {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    jobScheduleId: id(doc.jobScheduleId) ?? "",
    workerId: String(doc.workerId),
    jobType: doc.jobType as JobExecution["jobType"],
    status: doc.status as JobExecution["status"],
    attemptNumber: Number(doc.attemptNumber),
    startedAt: date(doc.startedAt),
    completedAt: doc.completedAt ? date(doc.completedAt) : null,
    executionTimeMs: doc.executionTimeMs === null || doc.executionTimeMs === undefined ? null : Number(doc.executionTimeMs),
    error: doc.error ? String(doc.error) : null,
    createdAt: date(doc.createdAt),
    updatedAt: date(doc.updatedAt),
  };
}

export function toJobResult(doc: Doc): JobResult {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    jobExecutionId: id(doc.jobExecutionId) ?? "",
    jobScheduleId: id(doc.jobScheduleId) ?? "",
    success: Boolean(doc.success),
    output: (doc.output as Record<string, unknown>) ?? {},
    error: doc.error ? String(doc.error) : null,
    createdAt: date(doc.createdAt),
  };
}

export function toFollowupWorkItem(doc: Doc): FollowupWorkItem {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    conversationId: id(doc.conversationId),
    leadId: id(doc.leadId) ?? "",
    followupDate: date(doc.followupDate),
    reason: String(doc.reason),
    priority: String(doc.priority),
    status: String(doc.status),
  };
}

export function toWorkflowActionWorkItem(doc: Doc): WorkflowActionWorkItem {
  return {
    id: doc._id.toString(),
    organizationId: id(doc.organizationId) ?? "",
    workflowExecutionId: id(doc.workflowExecutionId) ?? "",
    agentSessionId: id(doc.agentSessionId),
    conversationId: id(doc.conversationId),
    leadId: id(doc.leadId),
    actionType: String(doc.actionType),
    toolName: String(doc.toolName),
    input: (doc.input as Record<string, unknown>) ?? {},
    reasoning: String(doc.reasoning),
    confidence: Number(doc.confidence),
    status: String(doc.status),
  };
}

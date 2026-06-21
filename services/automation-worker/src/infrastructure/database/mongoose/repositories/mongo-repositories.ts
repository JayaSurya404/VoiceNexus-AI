import type {
  JobExecutionRepository,
  JobResultRepository,
  JobScheduleRepository,
  SharedWorkflowRepository,
  WorkerActionRepository,
} from "../../../../application/ports.js";
import type { JobStatus } from "../../../../domain/entities/job-execution.js";
import { JobExecutionModel } from "../models/job-execution-model.js";
import { JobResultModel } from "../models/job-result-model.js";
import { JobScheduleModel } from "../models/job-schedule-model.js";
import {
  ActionAuditModel,
  ActivityModel,
  LeadModel,
  NoteModel,
  ScheduledFollowupModel,
  TimelineEventModel,
  WorkflowActionModel,
  WorkflowExecutionModel,
} from "../models/shared-models.js";
import { toFollowupWorkItem, toJobExecution, toJobResult, toJobSchedule, toWorkflowActionWorkItem } from "./mappers.js";
import { objectId, objectIdOrThrow, serialize } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoJobScheduleRepository implements JobScheduleRepository {
  async create(input: Parameters<JobScheduleRepository["create"]>[0]) {
    const doc = await JobScheduleModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sourceId: objectIdOrThrow(input.sourceId),
    });
    return toJobSchedule(doc.toObject() as AnyDoc);
  }

  async ensure(input: Parameters<JobScheduleRepository["create"]>[0]) {
    try {
      return await this.create(input);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) return null;
      throw error;
    }
  }

  async findDue(now: Date, limit: number) {
    const docs = await JobScheduleModel.find({
      status: { $in: ["PENDING", "RETRYING"] },
      runAt: { $lte: now },
    }).sort({ runAt: 1 }).limit(limit).lean();
    return docs.map((doc) => toJobSchedule(doc as AnyDoc));
  }

  async findById(id: string) {
    const doc = await JobScheduleModel.findById(id).lean();
    return doc ? toJobSchedule(doc as AnyDoc) : null;
  }

  async listByStatus(statuses: JobStatus[], limit: number) {
    const docs = await JobScheduleModel.find({ status: { $in: statuses } }).sort({ runAt: 1 }).limit(limit).lean();
    return docs.map((doc) => toJobSchedule(doc as AnyDoc));
  }

  async markRunning(id: string, workerId: string) {
    const doc = await JobScheduleModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), status: { $in: ["PENDING", "RETRYING"] } },
      { status: "RUNNING", lockedAt: new Date(), lockedBy: workerId, $inc: { attemptCount: 1 } },
      { new: true },
    ).lean();
    return doc ? toJobSchedule(doc as AnyDoc) : null;
  }

  async update(id: string, input: Parameters<JobScheduleRepository["update"]>[1]) {
    const doc = await JobScheduleModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toJobSchedule(doc as AnyDoc) : null;
  }
}

export class MongoJobExecutionRepository implements JobExecutionRepository {
  async create(input: Parameters<JobExecutionRepository["create"]>[0]) {
    const doc = await JobExecutionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      jobScheduleId: objectIdOrThrow(input.jobScheduleId),
    });
    return toJobExecution(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await JobExecutionModel.findById(id).lean();
    return doc ? toJobExecution(doc as AnyDoc) : null;
  }

  async listBySchedule(jobScheduleId: string) {
    const docs = await JobExecutionModel.find({ jobScheduleId: objectIdOrThrow(jobScheduleId) }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toJobExecution(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<JobExecutionRepository["update"]>[1]) {
    const doc = await JobExecutionModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toJobExecution(doc as AnyDoc) : null;
  }
}

export class MongoJobResultRepository implements JobResultRepository {
  async create(input: Parameters<JobResultRepository["create"]>[0]) {
    const doc = await JobResultModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      jobExecutionId: objectIdOrThrow(input.jobExecutionId),
      jobScheduleId: objectIdOrThrow(input.jobScheduleId),
    });
    return toJobResult(doc.toObject() as AnyDoc);
  }

  async listByExecution(jobExecutionId: string) {
    const docs = await JobResultModel.find({ jobExecutionId: objectIdOrThrow(jobExecutionId) }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toJobResult(doc as AnyDoc));
  }

  async listBySchedule(jobScheduleId: string) {
    const docs = await JobResultModel.find({ jobScheduleId: objectIdOrThrow(jobScheduleId) }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toJobResult(doc as AnyDoc));
  }
}

export class MongoSharedWorkflowRepository implements SharedWorkflowRepository {
  async findDueFollowups(now: Date, limit: number) {
    const docs = await ScheduledFollowupModel.find({
      status: { $in: ["PENDING", "SCHEDULED"] },
      followupDate: { $lte: now },
    }).sort({ followupDate: 1 }).limit(limit).lean();
    return docs.map((doc) => toFollowupWorkItem(doc as AnyDoc));
  }

  async findRetryableWorkflowActions(limit: number) {
    const docs = await WorkflowActionModel.find({ status: { $in: ["PENDING", "FAILED"] } }).sort({ updatedAt: 1 }).limit(limit).lean();
    return docs.map((doc) => toWorkflowActionWorkItem(doc as AnyDoc));
  }

  async completeFollowup(id: string, organizationId: string) {
    await ScheduledFollowupModel.updateOne(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { status: "COMPLETED", completedAt: new Date() },
    );
  }

  async updateWorkflowAction(id: string, input: { status: string; output?: Record<string, unknown>; error?: string | null }) {
    await WorkflowActionModel.updateOne({ _id: objectIdOrThrow(id) }, input);
  }

  async updateWorkflowExecutionFromActions(workflowExecutionId: string) {
    const actions = await WorkflowActionModel.find({ workflowExecutionId: objectIdOrThrow(workflowExecutionId) }).lean();
    const completedActions = actions.filter((action) => ["SUCCEEDED", "SKIPPED"].includes(String((action as AnyDoc).status))).length;
    const failedActions = actions.filter((action) => String((action as AnyDoc).status) === "FAILED").length;
    await WorkflowExecutionModel.updateOne(
      { _id: objectIdOrThrow(workflowExecutionId) },
      {
        completedActions,
        failedActions,
        status: failedActions > 0 && completedActions > 0 ? "PARTIAL" : failedActions > 0 ? "FAILED" : "COMPLETED",
        completedAt: new Date(),
      },
    );
  }
}

export class MongoWorkerActionRepository implements WorkerActionRepository {
  async createCrmActivity(input: Parameters<WorkerActionRepository["createCrmActivity"]>[0]) {
    return serialize(await ActivityModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      type: input.type,
      title: input.title,
      description: input.description,
      createdBy: null,
      createdAt: new Date(),
    }));
  }

  async createNote(input: Parameters<WorkerActionRepository["createNote"]>[0]) {
    return serialize(await NoteModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      content: input.content,
      createdBy: null,
      createdAt: new Date(),
    }));
  }

  async updateLead(input: Parameters<WorkerActionRepository["updateLead"]>[0]) {
    return serialize(await LeadModel.findOneAndUpdate(
      { _id: objectIdOrThrow(input.leadId), organizationId: objectIdOrThrow(input.organizationId) },
      input.update,
      { new: true },
    ).lean());
  }

  async createTimelineEvent(input: Parameters<WorkerActionRepository["createTimelineEvent"]>[0]) {
    return serialize(await TimelineEventModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      eventType: input.eventType,
      title: input.title,
      description: input.description,
      metadata: input.metadata ?? {},
      createdBy: null,
      createdAt: new Date(),
    }));
  }

  async createAudit(input: Parameters<WorkerActionRepository["createAudit"]>[0]) {
    await ActionAuditModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sessionId: objectId(input.sessionId),
      conversationId: objectId(input.conversationId),
      workflowExecutionId: objectId(input.workflowExecutionId),
      workflowActionId: objectId(input.workflowActionId),
      createdAt: new Date(),
    });
  }
}

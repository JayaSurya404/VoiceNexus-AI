import type {
  ActionAuditRepository,
  ExternalActionRepository,
  ScheduledFollowupRepository,
  WorkflowActionRepository,
  WorkflowExecutionRepository,
} from "../../../../application/ports.js";
import { ActionAuditModel } from "../models/action-audit-model.js";
import { ScheduledFollowupModel } from "../models/scheduled-followup-model.js";
import { WorkflowActionModel } from "../models/workflow-action-model.js";
import { WorkflowExecutionModel } from "../models/workflow-execution-model.js";
import {
  ActivityModel,
  ContactModel,
  CustomerMemoryModel,
  CustomerPreferenceModel,
  LeadModel,
  NoteModel,
  TimelineEventModel,
} from "../models/external-models.js";
import { toActionAudit, toScheduledFollowup, toWorkflowAction, toWorkflowExecution } from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoWorkflowExecutionRepository implements WorkflowExecutionRepository {
  async create(input: Parameters<WorkflowExecutionRepository["create"]>[0]) {
    const doc = await WorkflowExecutionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agentSessionId: objectIdOrThrow(input.agentSessionId),
      conversationId: objectId(input.conversationId),
      leadId: objectId(input.leadId),
    });
    return toWorkflowExecution(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await WorkflowExecutionModel.findById(id).lean();
    return doc ? toWorkflowExecution(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await WorkflowExecutionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => toWorkflowExecution(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<WorkflowExecutionRepository["update"]>[1]) {
    const doc = await WorkflowExecutionModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toWorkflowExecution(doc as AnyDoc) : null;
  }
}

export class MongoWorkflowActionRepository implements WorkflowActionRepository {
  async create(input: Parameters<WorkflowActionRepository["create"]>[0]) {
    const doc = await WorkflowActionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      workflowExecutionId: objectIdOrThrow(input.workflowExecutionId),
      agentSessionId: objectId(input.agentSessionId),
      conversationId: objectId(input.conversationId),
      leadId: objectId(input.leadId),
    });
    return toWorkflowAction(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await WorkflowActionModel.findById(id).lean();
    return doc ? toWorkflowAction(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await WorkflowActionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => toWorkflowAction(doc as AnyDoc));
  }

  async listByWorkflow(workflowExecutionId: string) {
    const docs = await WorkflowActionModel.find({ workflowExecutionId: objectIdOrThrow(workflowExecutionId) }).sort({ createdAt: 1 }).lean();
    return docs.map((doc) => toWorkflowAction(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<WorkflowActionRepository["update"]>[1]) {
    const doc = await WorkflowActionModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toWorkflowAction(doc as AnyDoc) : null;
  }
}

export class MongoScheduledFollowupRepository implements ScheduledFollowupRepository {
  async create(input: Parameters<ScheduledFollowupRepository["create"]>[0]) {
    const doc = await ScheduledFollowupModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agentSessionId: objectId(input.agentSessionId),
      conversationId: objectId(input.conversationId),
      leadId: objectIdOrThrow(input.leadId),
      assignedTo: objectId(input.assignedTo),
      completedAt: null,
    });
    return toScheduledFollowup(doc.toObject() as AnyDoc);
  }

  async complete(id: string, organizationId: string) {
    const doc = await ScheduledFollowupModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { status: "COMPLETED", completedAt: new Date() },
      { new: true },
    ).lean();
    return doc ? toScheduledFollowup(doc as AnyDoc) : null;
  }

  async findById(id: string) {
    const doc = await ScheduledFollowupModel.findById(id).lean();
    return doc ? toScheduledFollowup(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await ScheduledFollowupModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ followupDate: 1 }).limit(100).lean();
    return docs.map((doc) => toScheduledFollowup(doc as AnyDoc));
  }
}

export class MongoActionAuditRepository implements ActionAuditRepository {
  async create(input: Parameters<ActionAuditRepository["create"]>[0]) {
    const doc = await ActionAuditModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sessionId: objectId(input.sessionId),
      conversationId: objectId(input.conversationId),
      workflowExecutionId: objectId(input.workflowExecutionId),
      workflowActionId: objectId(input.workflowActionId),
    });
    return toActionAudit(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await ActionAuditModel.findById(id).lean();
    return doc ? toActionAudit(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await ActionAuditModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(200).lean();
    return docs.map((doc) => toActionAudit(doc as AnyDoc));
  }
}

export class MongoExternalActionRepository implements ExternalActionRepository {
  async lookupLead(input: { organizationId: string; leadId: string }) {
    return serialize(await LeadModel.findOne({ _id: objectIdOrThrow(input.leadId), organizationId: objectIdOrThrow(input.organizationId) }).lean());
  }

  async updateLead(input: { organizationId: string; leadId: string; update: Record<string, unknown> }) {
    return serialize(await LeadModel.findOneAndUpdate(
      { _id: objectIdOrThrow(input.leadId), organizationId: objectIdOrThrow(input.organizationId) },
      { ...input.update, lastActivityAt: new Date() },
      { new: true },
    ).lean());
  }

  async updateContact(input: { organizationId: string; leadId: string; update: Record<string, unknown> }) {
    return serialize(await ContactModel.findOneAndUpdate(
      { leadId: objectIdOrThrow(input.leadId), organizationId: objectIdOrThrow(input.organizationId) },
      input.update,
      { new: true },
    ).lean());
  }

  async createNote(input: { organizationId: string; leadId: string; content: string }) {
    return serializeDoc(await NoteModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      content: input.content,
      createdBy: null,
      createdAt: new Date(),
    }));
  }

  async createActivity(input: { organizationId: string; leadId: string; type: string; title: string; description: string }) {
    return serializeDoc(await ActivityModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      type: input.type,
      title: input.title,
      description: input.description,
      createdBy: null,
      createdAt: new Date(),
    }));
  }

  async lookupMemory(input: { organizationId: string; leadId: string }) {
    const [memories, timeline] = await Promise.all([
      CustomerMemoryModel.find({ organizationId: objectIdOrThrow(input.organizationId), leadId: objectIdOrThrow(input.leadId) }).sort({ updatedAt: -1 }).limit(5).lean(),
      TimelineEventModel.find({ organizationId: objectIdOrThrow(input.organizationId), leadId: objectIdOrThrow(input.leadId) }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return { memories: memories.map(serialize), timeline: timeline.map(serialize) };
  }

  async createMemory(input: { organizationId: string; leadId: string; summary: string; source: string }) {
    return serializeDoc(await CustomerMemoryModel.create({
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectIdOrThrow(input.leadId),
      summary: input.summary,
      relationshipScore: 50,
      lastInteractionAt: new Date(),
      memoryTags: [input.source],
    }));
  }

  async updatePreference(input: { organizationId: string; leadId: string; update: Record<string, unknown> }) {
    return serialize(await CustomerPreferenceModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), leadId: objectIdOrThrow(input.leadId) },
      input.update,
      { new: true, upsert: true },
    ).lean());
  }

  async createTimelineEvent(input: { organizationId: string; leadId: string; eventType: string; title: string; description: string; metadata?: Record<string, unknown> }) {
    return serializeDoc(await TimelineEventModel.create({
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
}

function serialize(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (JSON.parse(JSON.stringify(value)) as Record<string, unknown>) : null;
}

function serializeDoc(value: unknown): Record<string, unknown> {
  return serialize(value) ?? {};
}

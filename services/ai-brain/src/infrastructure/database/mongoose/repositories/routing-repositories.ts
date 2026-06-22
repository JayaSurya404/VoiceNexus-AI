import type {
  AgentSkillRepository,
  QueueMemberRepository,
  QueueRepository,
  QueueSessionRepository,
  RoutingDecisionRepository,
  RoutingRuleRepository,
} from "../../../../application/ports.js";
import type { AgentSkill } from "../../../../domain/entities/agent-skill.js";
import type { Queue } from "../../../../domain/entities/queue.js";
import type { QueueMember } from "../../../../domain/entities/queue-member.js";
import type { QueueSession } from "../../../../domain/entities/queue-session.js";
import type { RoutingDecision } from "../../../../domain/entities/routing-decision.js";
import type { RoutingRule } from "../../../../domain/entities/routing-rule.js";
import { AgentSkillModel } from "../models/agent-skill-model.js";
import { QueueMemberModel } from "../models/queue-member-model.js";
import { QueueModel } from "../models/queue-model.js";
import { QueueSessionModel } from "../models/queue-session-model.js";
import { RoutingDecisionModel } from "../models/routing-decision-model.js";
import { RoutingRuleModel } from "../models/routing-rule-model.js";
import {
  toAgentSkill,
  toQueue,
  toQueueMember,
  toQueueSession,
  toRoutingDecision,
  toRoutingRule,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoQueueRepository implements QueueRepository {
  async create(input: Omit<Queue, "id" | "createdAt" | "updatedAt">) {
    const doc = await QueueModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      overflowQueueId: objectId(input.overflowQueueId),
    });
    return toQueue(doc.toObject() as AnyDoc);
  }

  async delete(id: string, organizationId: string) {
    const result = await QueueModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string) {
    const doc = await QueueModel.findById(id).lean();
    return doc ? toQueue(doc as AnyDoc) : null;
  }

  async findByName(organizationId: string, name: string) {
    const doc = await QueueModel.findOne({ organizationId: objectIdOrThrow(organizationId), name }).lean();
    return doc ? toQueue(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await QueueModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ active: -1, priority: -1, name: 1 }).lean();
    return docs.map((doc) => toQueue(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<QueueRepository["update"]>[2]) {
    const doc = await QueueModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { ...input, overflowQueueId: input.overflowQueueId === undefined ? undefined : objectId(input.overflowQueueId) },
      { new: true },
    ).lean();
    return doc ? toQueue(doc as AnyDoc) : null;
  }
}

export class MongoQueueMemberRepository implements QueueMemberRepository {
  async create(input: Omit<QueueMember, "id" | "createdAt" | "updatedAt">) {
    const doc = await QueueMemberModel.findOneAndUpdate(
      {
        organizationId: objectIdOrThrow(input.organizationId),
        queueId: objectIdOrThrow(input.queueId),
        agentId: objectIdOrThrow(input.agentId),
      },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        queueId: objectIdOrThrow(input.queueId),
        agentId: objectIdOrThrow(input.agentId),
      },
      { new: true, upsert: true },
    ).lean();
    return toQueueMember(doc as AnyDoc);
  }

  async listByAgent(organizationId: string, agentId: string) {
    const docs = await QueueMemberModel.find({ organizationId: objectIdOrThrow(organizationId), agentId: objectIdOrThrow(agentId) }).lean();
    return docs.map((doc) => toQueueMember(doc as AnyDoc));
  }

  async listByOrganization(organizationId: string) {
    const docs = await QueueMemberModel.find({ organizationId: objectIdOrThrow(organizationId) }).lean();
    return docs.map((doc) => toQueueMember(doc as AnyDoc));
  }

  async listByQueue(organizationId: string, queueId: string) {
    const docs = await QueueMemberModel.find({ organizationId: objectIdOrThrow(organizationId), queueId: objectIdOrThrow(queueId) }).lean();
    return docs.map((doc) => toQueueMember(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<QueueMemberRepository["update"]>[2]) {
    const doc = await QueueMemberModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toQueueMember(doc as AnyDoc) : null;
  }
}

export class MongoRoutingRuleRepository implements RoutingRuleRepository {
  async create(input: Omit<RoutingRule, "id" | "createdAt" | "updatedAt">) {
    const doc = await RoutingRuleModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      targetQueueId: objectId(input.targetQueueId),
      escalationQueueId: objectId(input.escalationQueueId),
    });
    return toRoutingRule(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await RoutingRuleModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ active: -1, priority: -1 }).lean();
    return docs.map((doc) => toRoutingRule(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<RoutingRuleRepository["update"]>[2]) {
    const doc = await RoutingRuleModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      {
        ...input,
        targetQueueId: input.targetQueueId === undefined ? undefined : objectId(input.targetQueueId),
        escalationQueueId: input.escalationQueueId === undefined ? undefined : objectId(input.escalationQueueId),
      },
      { new: true },
    ).lean();
    return doc ? toRoutingRule(doc as AnyDoc) : null;
  }
}

export class MongoRoutingDecisionRepository implements RoutingDecisionRepository {
  async create(input: Omit<RoutingDecision, "id">) {
    const doc = await RoutingDecisionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      queueSessionId: objectId(input.queueSessionId),
      queueId: objectId(input.queueId),
      agentId: objectId(input.agentId),
      escalationQueueId: objectId(input.escalationQueueId),
    });
    return toRoutingDecision(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string, limit = 100) {
    const docs = await RoutingDecisionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(limit).lean();
    return docs.map((doc) => toRoutingDecision(doc as AnyDoc));
  }

  async listByQueueSession(organizationId: string, queueSessionId: string) {
    const docs = await RoutingDecisionModel.find({
      organizationId: objectIdOrThrow(organizationId),
      queueSessionId: objectIdOrThrow(queueSessionId),
    }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toRoutingDecision(doc as AnyDoc));
  }
}

export class MongoQueueSessionRepository implements QueueSessionRepository {
  async create(input: Omit<QueueSession, "id" | "createdAt" | "updatedAt">) {
    const doc = await QueueSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      queueId: objectIdOrThrow(input.queueId),
      callId: objectId(input.callId),
      aiSessionId: objectId(input.aiSessionId),
      leadId: objectId(input.leadId),
      assignedAgentId: objectId(input.assignedAgentId),
      escalationPath: input.escalationPath.map(objectIdOrThrow),
    });
    return toQueueSession(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await QueueSessionModel.findById(id).lean();
    return doc ? toQueueSession(doc as AnyDoc) : null;
  }

  async listByAgent(organizationId: string, agentId: string) {
    const docs = await QueueSessionModel.find({
      organizationId: objectIdOrThrow(organizationId),
      assignedAgentId: objectIdOrThrow(agentId),
    }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toQueueSession(doc as AnyDoc));
  }

  async listByOrganization(organizationId: string) {
    const docs = await QueueSessionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(200).lean();
    return docs.map((doc) => toQueueSession(doc as AnyDoc));
  }

  async listByQueue(organizationId: string, queueId: string) {
    const docs = await QueueSessionModel.find({
      organizationId: objectIdOrThrow(organizationId),
      queueId: objectIdOrThrow(queueId),
    }).sort({ priority: -1, enteredAt: 1 }).limit(200).lean();
    return docs.map((doc) => toQueueSession(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<QueueSessionRepository["update"]>[2]) {
    const doc = await QueueSessionModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      {
        ...input,
        queueId: input.queueId === undefined ? undefined : objectIdOrThrow(input.queueId),
        assignedAgentId: input.assignedAgentId === undefined ? undefined : objectId(input.assignedAgentId),
        escalationPath: input.escalationPath?.map(objectIdOrThrow),
      },
      { new: true },
    ).lean();
    return doc ? toQueueSession(doc as AnyDoc) : null;
  }
}

export class MongoAgentSkillRepository implements AgentSkillRepository {
  async create(input: Omit<AgentSkill, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentSkillModel.findOneAndUpdate(
      {
        organizationId: objectIdOrThrow(input.organizationId),
        agentId: objectIdOrThrow(input.agentId),
        skill: input.skill.toUpperCase(),
      },
      {
        ...input,
        skill: input.skill.toUpperCase(),
        organizationId: objectIdOrThrow(input.organizationId),
        agentId: objectIdOrThrow(input.agentId),
      },
      { new: true, upsert: true },
    ).lean();
    return toAgentSkill(doc as AnyDoc);
  }

  async listByAgent(organizationId: string, agentId: string) {
    const docs = await AgentSkillModel.find({
      organizationId: objectIdOrThrow(organizationId),
      agentId: objectIdOrThrow(agentId),
    }).sort({ skill: 1 }).lean();
    return docs.map((doc) => toAgentSkill(doc as AnyDoc));
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentSkillModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ skill: 1, level: -1 }).lean();
    return docs.map((doc) => toAgentSkill(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentSkillRepository["update"]>[2]) {
    const doc = await AgentSkillModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { ...input, skill: input.skill?.toUpperCase() },
      { new: true },
    ).lean();
    return doc ? toAgentSkill(doc as AnyDoc) : null;
  }
}

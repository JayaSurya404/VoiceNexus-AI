import type {
  AgentCollaborationDecisionRepository,
  AgentCollaborationSessionRepository,
  AgentDelegationRepository,
  AgentTaskRepository,
  AgentTeamRepository,
} from "../../../../application/ports.js";
import type { AgentCollaborationDecision } from "../../../../domain/entities/agent-collaboration-decision.js";
import type { AgentCollaborationSession } from "../../../../domain/entities/agent-collaboration-session.js";
import type { AgentDelegation } from "../../../../domain/entities/agent-delegation.js";
import type { AgentTask } from "../../../../domain/entities/agent-task.js";
import type { AgentTeam } from "../../../../domain/entities/agent-team.js";
import { AgentCollaborationDecisionModel } from "../models/agent-collaboration-decision-model.js";
import { AgentCollaborationSessionModel } from "../models/agent-collaboration-session-model.js";
import { AgentDelegationModel } from "../models/agent-delegation-model.js";
import { AgentTaskModel } from "../models/agent-task-model.js";
import { AgentTeamModel } from "../models/agent-team-model.js";
import {
  toAgentCollaborationDecision,
  toAgentCollaborationSession,
  toAgentDelegation,
  toAgentTask,
  toAgentTeam,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoAgentTeamRepository implements AgentTeamRepository {
  async create(input: Omit<AgentTeam, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentTeamModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agents: input.agents.map((agent) => ({ ...agent, agentId: objectIdOrThrow(agent.agentId) })),
    });
    return toAgentTeam(doc.toObject() as AnyDoc);
  }

  async delete(id: string, organizationId: string) {
    const result = await AgentTeamModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string) {
    const doc = await AgentTeamModel.findById(id).lean();
    return doc ? toAgentTeam(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentTeamModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ active: -1, updatedAt: -1 })
      .limit(100)
      .lean();
    return docs.map((doc) => toAgentTeam(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentTeamRepository["update"]>[2]) {
    const doc = await AgentTeamModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      {
        ...input,
        agents: input.agents?.map((agent) => ({ ...agent, agentId: objectIdOrThrow(agent.agentId) })),
      },
      { new: true },
    ).lean();
    return doc ? toAgentTeam(doc as AnyDoc) : null;
  }
}

export class MongoAgentTaskRepository implements AgentTaskRepository {
  async create(input: Omit<AgentTask, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentTaskModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      collaborationSessionId: objectId(input.collaborationSessionId),
      teamId: objectId(input.teamId),
      assignedAgentId: objectId(input.assignedAgentId),
    });
    return toAgentTask(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await AgentTaskModel.findById(id).lean();
    return doc ? toAgentTask(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentTaskModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toAgentTask(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentTaskRepository["update"]>[2]) {
    const doc = await AgentTaskModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toAgentTask(doc as AnyDoc) : null;
  }
}

export class MongoAgentDelegationRepository implements AgentDelegationRepository {
  async create(input: Omit<AgentDelegation, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentDelegationModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      collaborationSessionId: objectId(input.collaborationSessionId),
      taskId: objectIdOrThrow(input.taskId),
      sourceAgentId: objectId(input.sourceAgentId),
      targetAgentId: objectId(input.targetAgentId),
    });
    return toAgentDelegation(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await AgentDelegationModel.findById(id).lean();
    return doc ? toAgentDelegation(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentDelegationModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toAgentDelegation(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentDelegationRepository["update"]>[2]) {
    const doc = await AgentDelegationModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toAgentDelegation(doc as AnyDoc) : null;
  }
}

export class MongoAgentCollaborationSessionRepository implements AgentCollaborationSessionRepository {
  async create(input: Omit<AgentCollaborationSession, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentCollaborationSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      teamId: objectId(input.teamId),
      conversationId: objectId(input.conversationId),
      agentSessionId: objectId(input.agentSessionId),
      primaryAgentId: objectId(input.primaryAgentId),
    });
    return toAgentCollaborationSession(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await AgentCollaborationSessionModel.findById(id).lean();
    return doc ? toAgentCollaborationSession(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentCollaborationSessionModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toAgentCollaborationSession(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentCollaborationSessionRepository["update"]>[2]) {
    const doc = await AgentCollaborationSessionModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toAgentCollaborationSession(doc as AnyDoc) : null;
  }
}

export class MongoAgentCollaborationDecisionRepository implements AgentCollaborationDecisionRepository {
  async create(input: Omit<AgentCollaborationDecision, "id">) {
    const doc = await AgentCollaborationDecisionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      collaborationSessionId: objectIdOrThrow(input.collaborationSessionId),
      agentId: objectId(input.agentId),
    });
    return toAgentCollaborationDecision(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await AgentCollaborationDecisionModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toAgentCollaborationDecision(doc as AnyDoc));
  }

  async listBySession(organizationId: string, collaborationSessionId: string) {
    const docs = await AgentCollaborationDecisionModel.find({
      organizationId: objectIdOrThrow(organizationId),
      collaborationSessionId: objectIdOrThrow(collaborationSessionId),
    }).sort({ createdAt: 1 }).lean();
    return docs.map((doc) => toAgentCollaborationDecision(doc as AnyDoc));
  }
}

import type {
  AgentAvailabilityRepository,
  HumanAgentRepository,
  HumanAgentSessionRepository,
  LiveTakeoverRepository,
  SupervisorSessionRepository,
  WhisperMessageRepository,
} from "../../../../application/ports.js";
import type { Agent } from "../../../../domain/entities/agent.js";
import type { AgentAvailability } from "../../../../domain/entities/agent-availability.js";
import type { HumanAgentSession } from "../../../../domain/entities/human-agent-session.js";
import { AgentAvailabilityModel } from "../models/agent-availability-model.js";
import { HumanAgentModel } from "../models/human-agent-model.js";
import { HumanAgentSessionModel } from "../models/human-agent-session-model.js";
import { LiveTakeoverModel } from "../models/live-takeover-model.js";
import { SupervisorSessionModel } from "../models/supervisor-session-model.js";
import { WhisperMessageModel } from "../models/whisper-message-model.js";
import {
  toAgentAvailability,
  toHumanAgent,
  toHumanAgentSession,
  toLiveTakeover,
  toSupervisorSession,
  toWhisperMessage,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoHumanAgentRepository implements HumanAgentRepository {
  async create(input: Omit<Agent, "id" | "createdAt" | "updatedAt">) {
    const doc = await HumanAgentModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      activeSessionId: objectId(input.activeSessionId),
    });
    return toHumanAgent(doc.toObject() as AnyDoc);
  }

  async delete(id: string, organizationId: string) {
    const result = await HumanAgentModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string) {
    const doc = await HumanAgentModel.findById(id).lean();
    return doc ? toHumanAgent(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await HumanAgentModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ name: 1 }).lean();
    return docs.map((doc) => toHumanAgent(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<HumanAgentRepository["update"]>[2]) {
    const doc = await HumanAgentModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { ...input, activeSessionId: input.activeSessionId === undefined ? undefined : objectId(input.activeSessionId) },
      { new: true },
    ).lean();
    return doc ? toHumanAgent(doc as AnyDoc) : null;
  }
}

export class MongoAgentAvailabilityRepository implements AgentAvailabilityRepository {
  async listByOrganization(organizationId: string) {
    const docs = await AgentAvailabilityModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).lean();
    return docs.map((doc) => toAgentAvailability(doc as AnyDoc));
  }

  async upsert(input: Omit<AgentAvailability, "id">) {
    const doc = await AgentAvailabilityModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), agentId: objectIdOrThrow(input.agentId) },
      { ...input, organizationId: objectIdOrThrow(input.organizationId), agentId: objectIdOrThrow(input.agentId) },
      { new: true, upsert: true },
    ).lean();
    return toAgentAvailability(doc as AnyDoc);
  }
}

export class MongoHumanAgentSessionRepository implements HumanAgentSessionRepository {
  async create(input: Omit<HumanAgentSession, "id" | "createdAt" | "updatedAt">) {
    const doc = await HumanAgentSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agentId: objectIdOrThrow(input.agentId),
      aiSessionId: objectId(input.aiSessionId),
      callId: objectId(input.callId),
      leadId: objectId(input.leadId),
    });
    return toHumanAgentSession(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await HumanAgentSessionModel.findById(id).lean();
    return doc ? toHumanAgentSession(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await HumanAgentSessionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toHumanAgentSession(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<HumanAgentSessionRepository["update"]>[1]) {
    const doc = await HumanAgentSessionModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toHumanAgentSession(doc as AnyDoc) : null;
  }
}

export class MongoLiveTakeoverRepository implements LiveTakeoverRepository {
  async create(input: Parameters<LiveTakeoverRepository["create"]>[0]) {
    const doc = await LiveTakeoverModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sessionId: objectIdOrThrow(input.sessionId),
      agentId: objectIdOrThrow(input.agentId),
      supervisorId: objectId(input.supervisorId),
    });
    return toLiveTakeover(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await LiveTakeoverModel.findById(id).lean();
    return doc ? toLiveTakeover(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await LiveTakeoverModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toLiveTakeover(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<LiveTakeoverRepository["update"]>[1]) {
    const doc = await LiveTakeoverModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return doc ? toLiveTakeover(doc as AnyDoc) : null;
  }
}

export class MongoWhisperMessageRepository implements WhisperMessageRepository {
  async create(input: Parameters<WhisperMessageRepository["create"]>[0]) {
    const doc = await WhisperMessageModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sessionId: objectIdOrThrow(input.sessionId),
      senderId: objectIdOrThrow(input.senderId),
      targetAgentId: objectId(input.targetAgentId),
    });
    return toWhisperMessage(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await WhisperMessageModel.findById(id).lean();
    return doc ? toWhisperMessage(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await WhisperMessageModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => toWhisperMessage(doc as AnyDoc));
  }
}

export class MongoSupervisorSessionRepository implements SupervisorSessionRepository {
  async create(input: Parameters<SupervisorSessionRepository["create"]>[0]) {
    const doc = await SupervisorSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      supervisorId: objectIdOrThrow(input.supervisorId),
      watchedSessionIds: input.watchedSessionIds.map(objectIdOrThrow),
    });
    return toSupervisorSession(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await SupervisorSessionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toSupervisorSession(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<SupervisorSessionRepository["update"]>[1]) {
    const doc = await SupervisorSessionModel.findByIdAndUpdate(
      id,
      { ...input, watchedSessionIds: input.watchedSessionIds?.map(objectIdOrThrow) },
      { new: true },
    ).lean();
    return doc ? toSupervisorSession(doc as AnyDoc) : null;
  }
}

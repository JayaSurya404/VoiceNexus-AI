import type {
  AgentDecisionRepository,
  AgentPersonaRepository,
  AgentSessionRepository,
  AIConversationRepository,
  AIMessageRepository,
  ConversationStateRepository,
  LeadQualificationRepository,
  ToolExecutionRepository,
} from "../../../../application/ports.js";
import type { AgentPersona } from "../../../../domain/entities/agent-persona.js";
import type { AgentSession } from "../../../../domain/entities/agent-session.js";
import type { AIConversation } from "../../../../domain/entities/ai-conversation.js";
import type { ConversationState } from "../../../../domain/entities/conversation-state.js";
import type { LeadQualification } from "../../../../domain/entities/lead-qualification.js";
import { AgentDecisionModel } from "../models/agent-decision-model.js";
import { AgentPersonaModel } from "../models/agent-persona-model.js";
import { AgentSessionModel } from "../models/agent-session-model.js";
import { AIConversationModel } from "../models/ai-conversation-model.js";
import { AIMessageModel } from "../models/ai-message-model.js";
import { ConversationStateModel } from "../models/conversation-state-model.js";
import { LeadQualificationModel } from "../models/lead-qualification-model.js";
import { ToolExecutionModel } from "../models/tool-execution-model.js";
import {
  toAgentDecision,
  toAgentPersona,
  toAgentSession,
  toAIConversation,
  toAIMessage,
  toConversationState,
  toLeadQualification,
  toToolExecution,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoAIConversationRepository implements AIConversationRepository {
  async create(input: Omit<AIConversation, "id" | "createdAt" | "updatedAt">): Promise<AIConversation> {
    const doc = await AIConversationModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectId(input.leadId),
      callId: objectId(input.callId),
    });
    return toAIConversation(doc.toObject() as AnyDoc);
  }

  async findByCall(organizationId: string, callId: string): Promise<AIConversation | null> {
    const doc = await AIConversationModel.findOne({ organizationId: objectIdOrThrow(organizationId), callId: objectIdOrThrow(callId) }).lean();
    return doc ? toAIConversation(doc as AnyDoc) : null;
  }

  async findById(id: string): Promise<AIConversation | null> {
    const doc = await AIConversationModel.findById(id).lean();
    return doc ? toAIConversation(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AIConversation[]> {
    const docs = await AIConversationModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toAIConversation(doc as AnyDoc));
  }

  async update(id: string, input: Partial<AIConversation>): Promise<AIConversation | null> {
    const update = { ...input, leadId: objectId(input.leadId), callId: objectId(input.callId) };
    const doc = await AIConversationModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? toAIConversation(doc as AnyDoc) : null;
  }
}

export class MongoAIMessageRepository implements AIMessageRepository {
  async create(input: Parameters<AIMessageRepository["create"]>[0]) {
    const doc = await AIMessageModel.create({ ...input, conversationId: objectIdOrThrow(input.conversationId) });
    return toAIMessage(doc.toObject() as AnyDoc);
  }

  async listByConversation(conversationId: string) {
    const docs = await AIMessageModel.find({ conversationId: objectIdOrThrow(conversationId) }).sort({ timestamp: 1 }).lean();
    return docs.map((doc) => toAIMessage(doc as AnyDoc));
  }
}

export class MongoToolExecutionRepository implements ToolExecutionRepository {
  async create(input: Parameters<ToolExecutionRepository["create"]>[0]) {
    const doc = await ToolExecutionModel.create({
      ...input,
      conversationId: objectId(input.conversationId),
      agentSessionId: objectId(input.agentSessionId),
    });
    return toToolExecution(doc.toObject() as AnyDoc);
  }

  async listByAgentSession(agentSessionId: string) {
    const docs = await ToolExecutionModel.find({ agentSessionId: objectIdOrThrow(agentSessionId) }).sort({ executedAt: -1 }).lean();
    return docs.map((doc) => toToolExecution(doc as AnyDoc));
  }

  async listByConversation(conversationId: string) {
    const docs = await ToolExecutionModel.find({ conversationId: objectIdOrThrow(conversationId) }).sort({ executedAt: -1 }).lean();
    return docs.map((doc) => toToolExecution(doc as AnyDoc));
  }
}

export class MongoLeadQualificationRepository implements LeadQualificationRepository {
  async findByLead(organizationId: string, leadId: string): Promise<LeadQualification | null> {
    const doc = await LeadQualificationModel.findOne({ organizationId: objectIdOrThrow(organizationId), leadId: objectIdOrThrow(leadId) }).lean();
    return doc ? toLeadQualification(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<LeadQualification[]> {
    const docs = await LeadQualificationModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ score: -1, updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toLeadQualification(doc as AnyDoc));
  }

  async upsert(input: Omit<LeadQualification, "id">): Promise<LeadQualification> {
    const doc = await LeadQualificationModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), leadId: objectIdOrThrow(input.leadId) },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        leadId: objectIdOrThrow(input.leadId),
        conversationId: objectId(input.conversationId),
        agentSessionId: objectId(input.agentSessionId),
      },
      { new: true, upsert: true },
    ).lean();
    return toLeadQualification(doc as AnyDoc);
  }
}

export class MongoAgentSessionRepository implements AgentSessionRepository {
  async create(input: Omit<AgentSession, "id" | "createdAt" | "updatedAt">): Promise<AgentSession> {
    const doc = await AgentSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agentPersonaId: objectIdOrThrow(input.agentPersonaId),
      leadId: objectId(input.leadId),
      callId: objectId(input.callId),
      aiConversationId: objectId(input.aiConversationId),
    });
    return toAgentSession(doc.toObject() as AnyDoc);
  }

  async findByCall(organizationId: string, callId: string): Promise<AgentSession | null> {
    const doc = await AgentSessionModel.findOne({ organizationId: objectIdOrThrow(organizationId), callId: objectIdOrThrow(callId) }).lean();
    return doc ? toAgentSession(doc as AnyDoc) : null;
  }

  async findById(id: string): Promise<AgentSession | null> {
    const doc = await AgentSessionModel.findById(id).lean();
    return doc ? toAgentSession(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AgentSession[]> {
    const docs = await AgentSessionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ updatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toAgentSession(doc as AnyDoc));
  }

  async update(id: string, input: Parameters<AgentSessionRepository["update"]>[1]): Promise<AgentSession | null> {
    const doc = await AgentSessionModel.findByIdAndUpdate(
      id,
      { ...input, aiConversationId: input.aiConversationId === undefined ? undefined : objectId(input.aiConversationId) },
      { new: true },
    ).lean();
    return doc ? toAgentSession(doc as AnyDoc) : null;
  }
}

export class MongoAgentPersonaRepository implements AgentPersonaRepository {
  async create(input: Omit<AgentPersona, "id" | "createdAt" | "updatedAt">): Promise<AgentPersona> {
    const doc = await AgentPersonaModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toAgentPersona(doc.toObject() as AnyDoc);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await AgentPersonaModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string): Promise<AgentPersona | null> {
    const doc = await AgentPersonaModel.findById(id).lean();
    return doc ? toAgentPersona(doc as AnyDoc) : null;
  }

  async findDefault(organizationId: string): Promise<AgentPersona | null> {
    const doc = await AgentPersonaModel.findOne({ organizationId: objectIdOrThrow(organizationId), isDefault: true }).lean();
    return doc ? toAgentPersona(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AgentPersona[]> {
    const docs = await AgentPersonaModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ isDefault: -1, name: 1 }).lean();
    return docs.map((doc) => toAgentPersona(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<AgentPersonaRepository["update"]>[2]): Promise<AgentPersona | null> {
    const doc = await AgentPersonaModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toAgentPersona(doc as AnyDoc) : null;
  }
}

export class MongoConversationStateRepository implements ConversationStateRepository {
  async findBySession(agentSessionId: string): Promise<ConversationState | null> {
    const doc = await ConversationStateModel.findOne({ agentSessionId: objectIdOrThrow(agentSessionId) }).lean();
    return doc ? toConversationState(doc as AnyDoc) : null;
  }

  async upsert(input: Omit<ConversationState, "id">): Promise<ConversationState> {
    const doc = await ConversationStateModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), agentSessionId: objectIdOrThrow(input.agentSessionId) },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        agentSessionId: objectIdOrThrow(input.agentSessionId),
        leadId: objectId(input.leadId),
        callId: objectId(input.callId),
      },
      { new: true, upsert: true },
    ).lean();
    return toConversationState(doc as AnyDoc);
  }
}

export class MongoAgentDecisionRepository implements AgentDecisionRepository {
  async create(input: Parameters<AgentDecisionRepository["create"]>[0]) {
    const doc = await AgentDecisionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      agentSessionId: objectIdOrThrow(input.agentSessionId),
      aiConversationId: objectId(input.aiConversationId),
    });
    return toAgentDecision(doc.toObject() as AnyDoc);
  }

  async listBySession(agentSessionId: string) {
    const docs = await AgentDecisionModel.find({ agentSessionId: objectIdOrThrow(agentSessionId) }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toAgentDecision(doc as AnyDoc));
  }

  async listByOrganization(organizationId: string, limit = 100) {
    const docs = await AgentDecisionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(limit).lean();
    return docs.map((doc) => toAgentDecision(doc as AnyDoc));
  }
}

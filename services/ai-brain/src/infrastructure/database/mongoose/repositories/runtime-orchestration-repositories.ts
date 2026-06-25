import { randomUUID } from "node:crypto";

import mongoose, { Schema, model } from "mongoose";
import type { Model } from "mongoose";

import type {
  CallRuntimeSession,
  OrganizationProviderRuntimeConfig,
  RuntimeConversationTurn,
  RuntimeFallbackEvent,
  RuntimeIncident,
  RuntimeSessionStatus
} from "../../../../domain/entities/runtime-orchestration.js";

type RuntimeSessionDocument = CallRuntimeSession & { _id: string };
type RuntimeCitationDocument = {
  documentId: string;
  chunkId?: string;
  title?: string;
  url?: string;
};
type RuntimeTurnDocument = Omit<RuntimeConversationTurn, "citations"> & {
  _id: string;
  citations: RuntimeCitationDocument[];
};
type RuntimeFallbackDocument = RuntimeFallbackEvent & { _id: string };
type RuntimeIncidentDocument = RuntimeIncident & { _id: string };
type ProviderConfigDocument = OrganizationProviderRuntimeConfig & { _id: string };

const runtimeCitationSchema = new Schema<RuntimeCitationDocument>(
  {
    documentId: { type: String, required: true },
    chunkId: { type: String },
    title: { type: String },
    url: { type: String }
  },
  { _id: false }
);

const runtimeSessionSchema = new Schema<RuntimeSessionDocument>(
  {
    _id: { type: String, default: randomUUID },
    id: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    callSid: { type: String, index: true },
    direction: { type: String, required: true },
    status: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    startedAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    completedAt: { type: Date },
    activeAgentId: { type: String },
    activeQueueId: { type: String },
    escalationId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { collection: "callruntimesessions", timestamps: true }
);

runtimeSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
runtimeSessionSchema.index({ organizationId: 1, callSid: 1 });

const runtimeTurnSchema = new Schema<RuntimeTurnDocument>(
  {
    _id: { type: String, default: randomUUID },
    id: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    userMessage: { type: String, required: true },
    assistantMessage: { type: String, required: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    citations: { type: [runtimeCitationSchema], default: [] },
    confidence: { type: Number, required: true },
    fallbackUsed: { type: Boolean, required: true },
    createdAt: { type: Date, required: true }
  },
  { collection: "runtimeconversationturns", timestamps: true }
);

runtimeTurnSchema.index({ organizationId: 1, sessionId: 1, createdAt: -1 });

const fallbackEventSchema = new Schema<RuntimeFallbackDocument>(
  {
    _id: { type: String, default: randomUUID },
    id: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    sessionId: { type: String, index: true },
    fromProvider: { type: String, required: true },
    toProvider: { type: String, required: true },
    reason: { type: String, required: true },
    recovered: { type: Boolean, required: true },
    createdAt: { type: Date, required: true }
  },
  { collection: "runtimefallbackevents", timestamps: true }
);

fallbackEventSchema.index({ organizationId: 1, createdAt: -1 });

const runtimeIncidentSchema = new Schema<RuntimeIncidentDocument>(
  {
    _id: { type: String, default: randomUUID },
    id: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    sessionId: { type: String, index: true },
    severity: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, required: true, index: true },
    createdAt: { type: Date, required: true },
    resolvedAt: { type: Date }
  },
  { collection: "runtimeincidents", timestamps: true }
);

runtimeIncidentSchema.index({ organizationId: 1, resolved: 1, createdAt: -1 });

const providerConfigSchema = new Schema<ProviderConfigDocument>(
  {
    _id: { type: String, default: randomUUID },
    organizationId: { type: String, required: true, unique: true, index: true },
    preferredProvider: { type: String, required: true },
    fallbackProviders: { type: [String], default: [] },
    modelByProvider: { type: Schema.Types.Mixed, default: {} },
    automaticFallback: { type: Boolean, required: true },
    active: { type: Boolean, required: true, index: true },
    updatedAt: { type: Date, required: true }
  },
  { collection: "organizationproviderruntimeconfigs", timestamps: true }
);

const RuntimeSessionModel: Model<RuntimeSessionDocument> =
  (mongoose.models.CallRuntimeSession as Model<RuntimeSessionDocument> | undefined) ??
  model<RuntimeSessionDocument>("CallRuntimeSession", runtimeSessionSchema);
const RuntimeTurnModel: Model<RuntimeTurnDocument> =
  (mongoose.models.RuntimeConversationTurn as Model<RuntimeTurnDocument> | undefined) ??
  model<RuntimeTurnDocument>("RuntimeConversationTurn", runtimeTurnSchema);
const RuntimeFallbackEventModel: Model<RuntimeFallbackDocument> =
  (mongoose.models.RuntimeFallbackEvent as Model<RuntimeFallbackDocument> | undefined) ??
  model<RuntimeFallbackDocument>("RuntimeFallbackEvent", fallbackEventSchema);
const RuntimeIncidentModel: Model<RuntimeIncidentDocument> =
  (mongoose.models.RuntimeIncident as Model<RuntimeIncidentDocument> | undefined) ??
  model<RuntimeIncidentDocument>("RuntimeIncident", runtimeIncidentSchema);
const ProviderRuntimeConfigModel: Model<ProviderConfigDocument> =
  (mongoose.models.OrganizationProviderRuntimeConfig as Model<ProviderConfigDocument> | undefined) ??
  model<ProviderConfigDocument>("OrganizationProviderRuntimeConfig", providerConfigSchema);

const toRuntimeSession = (document: RuntimeSessionDocument): CallRuntimeSession => ({
  id: document.id,
  organizationId: document.organizationId,
  conversationId: document.conversationId,
  ...(document.callSid ? { callSid: document.callSid } : {}),
  direction: document.direction,
  status: document.status,
  provider: document.provider,
  model: document.model,
  startedAt: document.startedAt,
  updatedAt: document.updatedAt,
  ...(document.completedAt ? { completedAt: document.completedAt } : {}),
  ...(document.activeAgentId ? { activeAgentId: document.activeAgentId } : {}),
  ...(document.activeQueueId ? { activeQueueId: document.activeQueueId } : {}),
  ...(document.escalationId ? { escalationId: document.escalationId } : {}),
  metadata: document.metadata
});

const toRuntimeTurn = (document: RuntimeTurnDocument): RuntimeConversationTurn => ({
  id: document.id,
  organizationId: document.organizationId,
  sessionId: document.sessionId,
  conversationId: document.conversationId,
  userMessage: document.userMessage,
  assistantMessage: document.assistantMessage,
  provider: document.provider,
  model: document.model,
  citations: document.citations,
  confidence: document.confidence,
  fallbackUsed: document.fallbackUsed,
  createdAt: document.createdAt
});

const toFallbackEvent = (document: RuntimeFallbackDocument): RuntimeFallbackEvent => ({
  id: document.id,
  organizationId: document.organizationId,
  ...(document.sessionId ? { sessionId: document.sessionId } : {}),
  fromProvider: document.fromProvider,
  toProvider: document.toProvider,
  reason: document.reason,
  recovered: document.recovered,
  createdAt: document.createdAt
});

const toRuntimeIncident = (document: RuntimeIncidentDocument): RuntimeIncident => ({
  id: document.id,
  organizationId: document.organizationId,
  ...(document.sessionId ? { sessionId: document.sessionId } : {}),
  severity: document.severity,
  category: document.category,
  message: document.message,
  resolved: document.resolved,
  createdAt: document.createdAt,
  ...(document.resolvedAt ? { resolvedAt: document.resolvedAt } : {})
});

const toProviderConfig = (document: ProviderConfigDocument): OrganizationProviderRuntimeConfig => ({
  organizationId: document.organizationId,
  preferredProvider: document.preferredProvider,
  fallbackProviders: document.fallbackProviders,
  modelByProvider: document.modelByProvider,
  automaticFallback: document.automaticFallback,
  active: document.active,
  updatedAt: document.updatedAt
});

export class MongoRuntimeSessionRepository {
  async create(input: Omit<CallRuntimeSession, "id" | "startedAt" | "updatedAt">): Promise<CallRuntimeSession> {
    const now = new Date();
    const session = await RuntimeSessionModel.create({
      ...input,
      id: randomUUID(),
      startedAt: now,
      updatedAt: now
    });
    return toRuntimeSession(session.toObject());
  }

  async updateStatus(
    organizationId: string,
    sessionId: string,
    status: RuntimeSessionStatus,
    updates: Partial<Pick<CallRuntimeSession, "activeAgentId" | "activeQueueId" | "escalationId" | "completedAt">> = {}
  ): Promise<CallRuntimeSession | null> {
    const session = await RuntimeSessionModel.findOneAndUpdate(
      { organizationId, id: sessionId },
      { $set: { ...updates, status, updatedAt: new Date() } },
      { new: true }
    ).lean<RuntimeSessionDocument | null>();
    return session ? toRuntimeSession(session) : null;
  }

  async attachCallSid(
    organizationId: string,
    sessionId: string,
    callSid: string,
    metadata: Record<string, unknown> = {},
  ): Promise<CallRuntimeSession | null> {
    const session = await RuntimeSessionModel.findOneAndUpdate(
      { organizationId, id: sessionId },
      {
        $set: {
          callSid,
          updatedAt: new Date(),
          metadata,
        },
      },
      { new: true },
    ).lean<RuntimeSessionDocument | null>();
    return session ? toRuntimeSession(session) : null;
  }

  async findById(organizationId: string, sessionId: string): Promise<CallRuntimeSession | null> {
    const session = await RuntimeSessionModel.findOne({ organizationId, id: sessionId }).lean<RuntimeSessionDocument | null>();
    return session ? toRuntimeSession(session) : null;
  }

  async findByCallSid(organizationId: string, callSid: string): Promise<CallRuntimeSession | null> {
    const session = await RuntimeSessionModel.findOne({ organizationId, callSid }).lean<RuntimeSessionDocument | null>();
    return session ? toRuntimeSession(session) : null;
  }

  async listByOrganization(organizationId: string, limit = 50): Promise<CallRuntimeSession[]> {
    const sessions = await RuntimeSessionModel.find({ organizationId }).sort({ updatedAt: -1 }).limit(limit).lean<RuntimeSessionDocument[]>();
    return sessions.map(toRuntimeSession);
  }

  async countActive(organizationId: string): Promise<number> {
    return RuntimeSessionModel.countDocuments({ organizationId, status: { $in: ["INITIALIZING", "ACTIVE", "ESCALATING", "HUMAN_ASSIGNED", "RECOVERING"] } });
  }
}

export class MongoRuntimeConversationTurnRepository {
  async create(input: Omit<RuntimeConversationTurn, "id" | "createdAt">): Promise<RuntimeConversationTurn> {
    const turn = await RuntimeTurnModel.create({ ...input, id: randomUUID(), createdAt: new Date() });
    return toRuntimeTurn(turn.toObject());
  }

  async listBySession(organizationId: string, sessionId: string, limit = 100): Promise<RuntimeConversationTurn[]> {
    const turns = await RuntimeTurnModel.find({ organizationId, sessionId }).sort({ createdAt: 1 }).limit(limit).lean<RuntimeTurnDocument[]>();
    return turns.map(toRuntimeTurn);
  }
}

export class MongoRuntimeFallbackEventRepository {
  async create(input: Omit<RuntimeFallbackEvent, "id" | "createdAt">): Promise<RuntimeFallbackEvent> {
    const event = await RuntimeFallbackEventModel.create({ ...input, id: randomUUID(), createdAt: new Date() });
    return toFallbackEvent(event.toObject());
  }

  async listByOrganization(organizationId: string, limit = 50): Promise<RuntimeFallbackEvent[]> {
    const events = await RuntimeFallbackEventModel.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).lean<RuntimeFallbackDocument[]>();
    return events.map(toFallbackEvent);
  }
}

export class MongoRuntimeIncidentRepository {
  async create(input: Omit<RuntimeIncident, "id" | "createdAt" | "resolved">): Promise<RuntimeIncident> {
    const incident = await RuntimeIncidentModel.create({ ...input, id: randomUUID(), resolved: false, createdAt: new Date() });
    return toRuntimeIncident(incident.toObject());
  }

  async listByOrganization(organizationId: string, limit = 50): Promise<RuntimeIncident[]> {
    const incidents = await RuntimeIncidentModel.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).lean<RuntimeIncidentDocument[]>();
    return incidents.map(toRuntimeIncident);
  }
}

export class MongoProviderRuntimeConfigRepository {
  async getByOrganization(organizationId: string): Promise<OrganizationProviderRuntimeConfig | null> {
    const config = await ProviderRuntimeConfigModel.findOne({ organizationId, active: true }).lean<ProviderConfigDocument | null>();
    return config ? toProviderConfig(config) : null;
  }

  async upsert(input: OrganizationProviderRuntimeConfig): Promise<OrganizationProviderRuntimeConfig> {
    const config = await ProviderRuntimeConfigModel.findOneAndUpdate(
      { organizationId: input.organizationId },
      { $set: { ...input, updatedAt: new Date() } },
      { new: true, upsert: true }
    ).lean<ProviderConfigDocument>();
    return toProviderConfig(config);
  }
}

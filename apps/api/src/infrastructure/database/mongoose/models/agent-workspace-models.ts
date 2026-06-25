import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { AgentPersonaRole, AgentRole, AgentRuntimeStatus, AgentStatus, AgentVoiceProvider } from "@voicenexus/contracts";

export interface AgentWorkspaceDocument {
  organizationId: Types.ObjectId;
  name: string;
  email: string;
  role: AgentRole;
  status: AgentStatus;
  runtimeStatus: AgentRuntimeStatus;
  activeSessionId: Types.ObjectId | null;
  skills: string[];
  personaId: Types.ObjectId | null;
  voiceProvider: AgentVoiceProvider;
  voiceId: string;
  knowledgeBaseIds: Types.ObjectId[];
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
}

const agentWorkspaceSchema = new mongoose.Schema<AgentWorkspaceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    role: { type: String, enum: ["AGENT", "SUPERVISOR", "MANAGER"], default: "AGENT" },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE", "BREAK"], default: "OFFLINE", index: true },
    runtimeStatus: { type: String, enum: ["READY", "TESTING", "ACTIVE", "PAUSED", "ERROR"], default: "READY", index: true },
    activeSessionId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    skills: { type: [String], default: [] },
    personaId: { type: mongoose.Schema.Types.ObjectId, ref: "AgentPersona", default: null, index: true },
    voiceProvider: { type: String, enum: ["NONE", "OPENAI", "ELEVENLABS", "CARTESIA"], default: "NONE" },
    voiceId: { type: String, trim: true, default: "", maxlength: 120 },
    knowledgeBaseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeBase" }],
    prompt: { type: String, trim: true, default: "", maxlength: 12000 },
  },
  { collection: "agents", timestamps: true },
);

agentWorkspaceSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export interface AgentPersonaWorkspaceDocument {
  organizationId: Types.ObjectId;
  name: string;
  role: AgentPersonaRole;
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const agentPersonaWorkspaceSchema = new mongoose.Schema<AgentPersonaWorkspaceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, enum: ["SALES_AGENT", "SUPPORT_AGENT", "APPOINTMENT_SETTER", "COLLECTIONS_AGENT"], required: true },
    systemPrompt: { type: String, required: true, trim: true, maxlength: 12000 },
    tone: { type: String, required: true, trim: true, maxlength: 500 },
    goals: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false, index: true },
  },
  { collection: "agentpersonas", timestamps: true },
);

agentPersonaWorkspaceSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export interface AgentSkillWorkspaceDocument {
  organizationId: Types.ObjectId;
  agentId: Types.ObjectId;
  skill: string;
  level: number;
  certified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const agentSkillWorkspaceSchema = new mongoose.Schema<AgentSkillWorkspaceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    skill: { type: String, required: true, trim: true, uppercase: true, maxlength: 48 },
    level: { type: Number, min: 1, max: 5, default: 1 },
    certified: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  { collection: "agentskills", timestamps: true },
);

agentSkillWorkspaceSchema.index({ organizationId: 1, agentId: 1, skill: 1 }, { unique: true });

export interface AgentAvailabilityWorkspaceDocument {
  organizationId: Types.ObjectId;
  agentId: Types.ObjectId;
  status: AgentStatus;
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string; timezone: string; active: boolean }>;
  updatedAt: Date;
}

const agentAvailabilityWorkspaceSchema = new mongoose.Schema<AgentAvailabilityWorkspaceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE", "BREAK"], required: true, index: true },
    statusReason: { type: String, default: null, maxlength: 500 },
    capacity: { type: Number, min: 1, default: 1 },
    activeSessionCount: { type: Number, min: 0, default: 0 },
    schedule: {
      type: [
        {
          dayOfWeek: Number,
          startTime: String,
          endTime: String,
          timezone: String,
          active: Boolean,
        },
      ],
      default: [],
    },
    updatedAt: { type: Date, required: true },
  },
  { collection: "agentavailabilities" },
);

agentAvailabilityWorkspaceSchema.index({ organizationId: 1, agentId: 1 }, { unique: true });

export interface AgentPerformanceWorkspaceDocument {
  organizationId: Types.ObjectId;
  agentId: Types.ObjectId;
  callsHandled: number;
  averageDuration: number;
  averageQaScore: number;
  averageSentiment: number;
  transfers: number;
  conversions: number;
  leadQuality: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const agentPerformanceWorkspaceSchema = new mongoose.Schema<AgentPerformanceWorkspaceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    callsHandled: { type: Number, min: 0, default: 0 },
    averageDuration: { type: Number, min: 0, default: 0 },
    averageQaScore: { type: Number, min: 0, max: 100, default: 0 },
    averageSentiment: { type: Number, min: -1, max: 1, default: 0 },
    transfers: { type: Number, min: 0, default: 0 },
    conversions: { type: Number, min: 0, default: 0 },
    leadQuality: { type: Number, min: 0, default: 0 },
    computedAt: { type: Date, required: true, index: true },
  },
  { collection: "agentperformances", timestamps: true },
);

agentPerformanceWorkspaceSchema.index({ organizationId: 1, agentId: 1 }, { unique: true });

export type AgentWorkspaceMongoDocument = HydratedDocument<AgentWorkspaceDocument>;
export type AgentPersonaWorkspaceMongoDocument = HydratedDocument<AgentPersonaWorkspaceDocument>;
export type AgentSkillWorkspaceMongoDocument = HydratedDocument<AgentSkillWorkspaceDocument>;
export type AgentAvailabilityWorkspaceMongoDocument = HydratedDocument<AgentAvailabilityWorkspaceDocument>;
export type AgentPerformanceWorkspaceMongoDocument = HydratedDocument<AgentPerformanceWorkspaceDocument>;

export const AgentWorkspaceModel =
  (mongoose.models.AgentWorkspace as Model<AgentWorkspaceDocument> | undefined) ??
  mongoose.model<AgentWorkspaceDocument>("AgentWorkspace", agentWorkspaceSchema);
export const AgentPersonaWorkspaceModel =
  (mongoose.models.AgentPersonaWorkspace as Model<AgentPersonaWorkspaceDocument> | undefined) ??
  mongoose.model<AgentPersonaWorkspaceDocument>("AgentPersonaWorkspace", agentPersonaWorkspaceSchema);
export const AgentSkillWorkspaceModel =
  (mongoose.models.AgentSkillWorkspace as Model<AgentSkillWorkspaceDocument> | undefined) ??
  mongoose.model<AgentSkillWorkspaceDocument>("AgentSkillWorkspace", agentSkillWorkspaceSchema);
export const AgentAvailabilityWorkspaceModel =
  (mongoose.models.AgentAvailabilityWorkspace as Model<AgentAvailabilityWorkspaceDocument> | undefined) ??
  mongoose.model<AgentAvailabilityWorkspaceDocument>("AgentAvailabilityWorkspace", agentAvailabilityWorkspaceSchema);
export const AgentPerformanceWorkspaceModel =
  (mongoose.models.AgentPerformanceWorkspace as Model<AgentPerformanceWorkspaceDocument> | undefined) ??
  mongoose.model<AgentPerformanceWorkspaceDocument>("AgentPerformanceWorkspace", agentPerformanceWorkspaceSchema);

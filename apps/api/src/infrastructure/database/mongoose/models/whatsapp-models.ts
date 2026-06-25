import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type {
  WhatsappAutomationTrigger,
  WhatsappConversationStatus,
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateStatus,
} from "@voicenexus/contracts";

export interface WhatsappContactDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId | null;
  displayName: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string;
  lastConversationAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappContactSchema = new mongoose.Schema<WhatsappContactDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    displayName: { type: String, trim: true, required: true, maxlength: 120 },
    phone: { type: String, trim: true, required: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, default: null, maxlength: 254 },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true, default: "", maxlength: 2000 },
    lastConversationAt: { type: Date, default: null },
  },
  { timestamps: true },
);

whatsappContactSchema.index({ organizationId: 1, phone: 1 }, { unique: true });
whatsappContactSchema.index({ organizationId: 1, displayName: "text", phone: "text", email: "text" });

export interface WhatsappConversationDocument {
  organizationId: Types.ObjectId;
  contactId: Types.ObjectId;
  leadId: Types.ObjectId | null;
  subject: string;
  status: WhatsappConversationStatus;
  assignedTo: Types.ObjectId | null;
  aiEnabled: boolean;
  lastMessagePreview: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  runtimeState: "IDLE" | "WAITING_FOR_CUSTOMER" | "WAITING_FOR_AGENT" | "AI_REPLYING";
  runtimeUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappConversationSchema = new mongoose.Schema<WhatsappConversationDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappContact", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    subject: { type: String, trim: true, default: "WhatsApp conversation", maxlength: 160 },
    status: { type: String, enum: ["OPEN", "PENDING", "RESOLVED", "ARCHIVED"], default: "OPEN", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    aiEnabled: { type: Boolean, default: true, index: true },
    lastMessagePreview: { type: String, trim: true, default: "", maxlength: 240 },
    lastMessageAt: { type: Date, default: null, index: true },
    unreadCount: { type: Number, default: 0, min: 0 },
    runtimeState: {
      type: String,
      enum: ["IDLE", "WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT", "AI_REPLYING"],
      default: "IDLE",
    },
    runtimeUpdatedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

whatsappConversationSchema.index({ organizationId: 1, lastMessageAt: -1 });

export interface WhatsappMessageDocument {
  organizationId: Types.ObjectId;
  conversationId: Types.ObjectId;
  contactId: Types.ObjectId;
  direction: WhatsappMessageDirection;
  body: string;
  status: WhatsappMessageStatus;
  sentBy: Types.ObjectId | null;
  isAiGenerated: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const whatsappMessageSchema = new mongoose.Schema<WhatsappMessageDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappConversation", required: true, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappContact", required: true, index: true },
    direction: { type: String, enum: ["INBOUND", "OUTBOUND"], required: true, index: true },
    body: { type: String, trim: true, required: true, maxlength: 4096 },
    status: { type: String, enum: ["QUEUED", "SENT", "DELIVERED", "READ", "FAILED"], default: "SENT" },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isAiGenerated: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

whatsappMessageSchema.index({ organizationId: 1, conversationId: 1, createdAt: 1 });

export interface WhatsappTemplateDocument {
  organizationId: Types.ObjectId;
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  body: string;
  variables: string[];
  status: WhatsappTemplateStatus;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappTemplateSchema = new mongoose.Schema<WhatsappTemplateDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, trim: true, required: true, maxlength: 80 },
    category: { type: String, enum: ["MARKETING", "UTILITY", "AUTHENTICATION", "SERVICE"], default: "UTILITY" },
    language: { type: String, trim: true, default: "en", maxlength: 16 },
    body: { type: String, trim: true, required: true, maxlength: 4096 },
    variables: { type: [String], default: [] },
    status: { type: String, enum: ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"], default: "DRAFT" },
  },
  { timestamps: true },
);

whatsappTemplateSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export interface WhatsappBroadcastDocument {
  organizationId: Types.ObjectId;
  name: string;
  templateId: Types.ObjectId | null;
  messageBody: string;
  contactIds: Types.ObjectId[];
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledAt: Date | null;
  sentAt: Date | null;
  metrics: {
    total: number;
    queued: number;
    sent: number;
    failed: number;
  };
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappBroadcastSchema = new mongoose.Schema<WhatsappBroadcastDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, trim: true, required: true, maxlength: 120 },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappTemplate", default: null },
    messageBody: { type: String, trim: true, required: true, maxlength: 4096 },
    contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WhatsappContact", required: true }],
    status: { type: String, enum: ["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED"], default: "DRAFT" },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    metrics: {
      total: { type: Number, default: 0 },
      queued: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export interface WhatsappAutomationDocument {
  organizationId: Types.ObjectId;
  name: string;
  trigger: WhatsappAutomationTrigger;
  keyword: string;
  responseBody: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappAutomationSchema = new mongoose.Schema<WhatsappAutomationDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, trim: true, required: true, maxlength: 120 },
    trigger: { type: String, enum: ["FIRST_MESSAGE", "KEYWORD", "NO_RESPONSE", "BUSINESS_HOURS"], required: true },
    keyword: { type: String, trim: true, default: "", maxlength: 80 },
    responseBody: { type: String, trim: true, required: true, maxlength: 4096 },
    isEnabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type WhatsappContactMongoDocument = HydratedDocument<WhatsappContactDocument>;
export type WhatsappConversationMongoDocument = HydratedDocument<WhatsappConversationDocument>;
export type WhatsappMessageMongoDocument = HydratedDocument<WhatsappMessageDocument>;
export type WhatsappTemplateMongoDocument = HydratedDocument<WhatsappTemplateDocument>;
export type WhatsappBroadcastMongoDocument = HydratedDocument<WhatsappBroadcastDocument>;
export type WhatsappAutomationMongoDocument = HydratedDocument<WhatsappAutomationDocument>;

export const WhatsappContactModel =
  (mongoose.models.WhatsappContact as Model<WhatsappContactDocument> | undefined) ??
  mongoose.model<WhatsappContactDocument>("WhatsappContact", whatsappContactSchema);
export const WhatsappConversationModel =
  (mongoose.models.WhatsappConversation as Model<WhatsappConversationDocument> | undefined) ??
  mongoose.model<WhatsappConversationDocument>("WhatsappConversation", whatsappConversationSchema);
export const WhatsappMessageModel =
  (mongoose.models.WhatsappMessage as Model<WhatsappMessageDocument> | undefined) ??
  mongoose.model<WhatsappMessageDocument>("WhatsappMessage", whatsappMessageSchema);
export const WhatsappTemplateModel =
  (mongoose.models.WhatsappTemplate as Model<WhatsappTemplateDocument> | undefined) ??
  mongoose.model<WhatsappTemplateDocument>("WhatsappTemplate", whatsappTemplateSchema);
export const WhatsappBroadcastModel =
  (mongoose.models.WhatsappBroadcast as Model<WhatsappBroadcastDocument> | undefined) ??
  mongoose.model<WhatsappBroadcastDocument>("WhatsappBroadcast", whatsappBroadcastSchema);
export const WhatsappAutomationModel =
  (mongoose.models.WhatsappAutomation as Model<WhatsappAutomationDocument> | undefined) ??
  mongoose.model<WhatsappAutomationDocument>("WhatsappAutomation", whatsappAutomationSchema);

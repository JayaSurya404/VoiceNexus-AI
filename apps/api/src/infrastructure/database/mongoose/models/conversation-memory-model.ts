import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { MemorySentiment, MemorySource } from "@voicenexus/contracts";

export interface ConversationMemoryDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  source: MemorySource;
  content: string;
  sentiment: MemorySentiment;
  importance: number;
  createdAt: Date;
}

const conversationMemorySchema = new mongoose.Schema<ConversationMemoryDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    source: { type: String, enum: ["CALL", "WHATSAPP", "EMAIL", "NOTE"], required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 10_000 },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"], default: "NEUTRAL" },
    importance: { type: Number, default: 3, min: 1, max: 5, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

conversationMemorySchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });
conversationMemorySchema.index({ organizationId: 1, importance: -1, createdAt: -1 });

export type ConversationMemoryMongoDocument = HydratedDocument<ConversationMemoryDocument>;

export const ConversationMemoryModel =
  (mongoose.models.ConversationMemory as Model<ConversationMemoryDocument> | undefined) ??
  mongoose.model<ConversationMemoryDocument>("ConversationMemory", conversationMemorySchema);

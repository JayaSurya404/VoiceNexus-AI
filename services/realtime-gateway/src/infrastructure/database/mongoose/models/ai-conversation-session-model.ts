import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { AiConversationStatus } from "../../../../domain/entities/ai-conversation-session.js";

export interface AiConversationSessionDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  providerCallSid: string | null;
  streamSid: string | null;
  status: AiConversationStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const aiConversationSessionSchema = new mongoose.Schema<AiConversationSessionDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CallSession", required: true, index: true },
    providerCallSid: { type: String, trim: true, default: null, maxlength: 80, index: true },
    streamSid: { type: String, trim: true, default: null, maxlength: 80, index: true },
    status: { type: String, enum: ["CONNECTING", "ACTIVE", "ENDED", "FAILED"], required: true, index: true },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

aiConversationSessionSchema.index({ organizationId: 1, callSessionId: 1 }, { unique: true });
aiConversationSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type AiConversationSessionMongoDocument = HydratedDocument<AiConversationSessionDocument>;

export const AiConversationSessionModel =
  (mongoose.models.AiConversationSession as Model<AiConversationSessionDocument> | undefined) ??
  mongoose.model<AiConversationSessionDocument>("AiConversationSession", aiConversationSessionSchema);

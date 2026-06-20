import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { RealtimeTranscriptEventType } from "../../../../domain/entities/realtime-transcript-event.js";

export interface RealtimeTranscriptEventDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  aiConversationSessionId: Types.ObjectId | null;
  type: RealtimeTranscriptEventType;
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  language: string | null;
  confidence: number | null;
  sequenceNumber: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const realtimeTranscriptEventSchema = new mongoose.Schema<RealtimeTranscriptEventDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CallSession", required: true, index: true },
    aiConversationSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiConversationSession",
      default: null,
      index: true,
    },
    type: { type: String, enum: ["PARTIAL", "FINAL"], required: true, index: true },
    speaker: { type: String, enum: ["CUSTOMER", "ASSISTANT", "SYSTEM"], required: true },
    text: { type: String, required: true, trim: true, maxlength: 10_000 },
    language: { type: String, trim: true, default: null, maxlength: 24 },
    confidence: { type: Number, default: null, min: 0, max: 1 },
    sequenceNumber: { type: Number, required: true, min: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

realtimeTranscriptEventSchema.index({ organizationId: 1, callSessionId: 1, sequenceNumber: 1 });
realtimeTranscriptEventSchema.index({ organizationId: 1, callSessionId: 1, createdAt: 1 });

export type RealtimeTranscriptEventMongoDocument = HydratedDocument<RealtimeTranscriptEventDocument>;

export const RealtimeTranscriptEventModel =
  (mongoose.models.RealtimeTranscriptEvent as Model<RealtimeTranscriptEventDocument> | undefined) ??
  mongoose.model<RealtimeTranscriptEventDocument>("RealtimeTranscriptEvent", realtimeTranscriptEventSchema);

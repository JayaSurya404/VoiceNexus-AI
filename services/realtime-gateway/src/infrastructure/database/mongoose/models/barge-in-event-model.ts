import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface BargeInEventDocument {
  organizationId: Types.ObjectId;
  realtimeConversationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  playbackSessionId: Types.ObjectId | null;
  voiceResponseId: Types.ObjectId | null;
  transcriptFragment: string | null;
  reason: string;
  detectedAt: Date;
  createdAt: Date;
}

const bargeInEventSchema = new mongoose.Schema<BargeInEventDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    realtimeConversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    playbackSessionId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    voiceResponseId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    transcriptFragment: { type: String, default: null },
    reason: { type: String, required: true },
    detectedAt: { type: Date, required: true, index: true },
  },
  { collection: "bargeinevents", timestamps: { createdAt: true, updatedAt: false } },
);

bargeInEventSchema.index({ organizationId: 1, realtimeConversationId: 1, detectedAt: -1 });

export type BargeInEventMongoDocument = HydratedDocument<BargeInEventDocument>;
export const BargeInEventModel =
  (mongoose.models.BargeInEvent as Model<BargeInEventDocument> | undefined) ??
  mongoose.model<BargeInEventDocument>("BargeInEvent", bargeInEventSchema);

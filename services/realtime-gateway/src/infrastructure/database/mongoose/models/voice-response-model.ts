import mongoose, { Schema, type InferSchemaType } from "mongoose";

const voiceResponseSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    responseText: { type: String, required: true },
    provider: { type: String, required: true, index: true },
    voice: { type: String, required: true },
    audioUrl: { type: String, default: null },
    durationMs: { type: Number, default: 0 },
    audioBytes: { type: Number, default: 0 },
    status: { type: String, enum: ["PENDING", "GENERATING", "QUEUED", "PLAYING", "COMPLETED", "FAILED"], required: true, index: true },
    latencyMs: { type: Number, default: null },
    playbackStartedAt: { type: Date, default: null },
    playbackCompletedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { collection: "voiceresponses", timestamps: true },
);

voiceResponseSchema.index({ organizationId: 1, createdAt: -1 });
voiceResponseSchema.index({ organizationId: 1, sessionId: 1, createdAt: -1 });
voiceResponseSchema.index({ organizationId: 1, callId: 1, createdAt: -1 });

export type VoiceResponseDocument = InferSchemaType<typeof voiceResponseSchema> & { _id: mongoose.Types.ObjectId };
export const VoiceResponseModel =
  (mongoose.models.VoiceResponse ??
    mongoose.model<VoiceResponseDocument>("VoiceResponse", voiceResponseSchema)) as mongoose.Model<VoiceResponseDocument>;

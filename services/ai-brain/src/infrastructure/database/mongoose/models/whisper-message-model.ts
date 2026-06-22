import mongoose, { Schema, type InferSchemaType } from "mongoose";

const whisperMessageSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, required: true, index: true },
    senderRole: { type: String, enum: ["SUPERVISOR", "AGENT"], required: true },
    target: { type: String, enum: ["AGENT", "AI"], required: true, index: true },
    targetAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    content: { type: String, required: true },
    private: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true },
  },
  { collection: "whispermessages" },
);

whisperMessageSchema.index({ organizationId: 1, sessionId: 1, createdAt: -1 });

export type WhisperMessageDocument = InferSchemaType<typeof whisperMessageSchema> & { _id: mongoose.Types.ObjectId };
export const WhisperMessageModel =
  (mongoose.models.WhisperMessage ?? mongoose.model("WhisperMessage", whisperMessageSchema)) as mongoose.Model<any>;

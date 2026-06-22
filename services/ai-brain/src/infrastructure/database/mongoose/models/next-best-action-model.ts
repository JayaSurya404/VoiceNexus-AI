import mongoose, { Schema, type InferSchemaType } from "mongoose";

const nextBestActionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    coachingSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    actionType: { type: String, enum: ["ASK_QUESTION", "SCHEDULE_MEETING", "SEND_FOLLOW_UP", "ESCALATE", "TRANSFER", "CLOSE_OPPORTUNITY"], required: true, index: true },
    label: { type: String, required: true },
    rationale: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], required: true, default: "MEDIUM", index: true },
    completed: { type: Boolean, required: true, default: false, index: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "nextbestactions" },
);

nextBestActionSchema.index({ organizationId: 1, createdAt: -1 });
nextBestActionSchema.index({ organizationId: 1, coachingSessionId: 1, createdAt: -1 });

export type NextBestActionDocument = InferSchemaType<typeof nextBestActionSchema> & { _id: mongoose.Types.ObjectId };
export const NextBestActionModel =
  (mongoose.models.NextBestAction ??
    mongoose.model("NextBestAction", nextBestActionSchema)) as mongoose.Model<any>;

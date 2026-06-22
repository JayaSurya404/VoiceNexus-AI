import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentCoachingSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    humanSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    aiSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "ESCALATED"], required: true, default: "ACTIVE", index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
  },
  { collection: "agentcoachingsessions", timestamps: true },
);

agentCoachingSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
agentCoachingSessionSchema.index({ organizationId: 1, agentId: 1, status: 1 });

export type AgentCoachingSessionDocument = InferSchemaType<typeof agentCoachingSessionSchema> & { _id: mongoose.Types.ObjectId };
export const AgentCoachingSessionModel =
  (mongoose.models.AgentCoachingSession ??
    mongoose.model("AgentCoachingSession", agentCoachingSessionSchema)) as mongoose.Model<any>;

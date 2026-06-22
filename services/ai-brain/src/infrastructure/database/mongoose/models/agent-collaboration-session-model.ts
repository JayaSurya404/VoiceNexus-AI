import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentCollaborationSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    primaryAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "REVIEW", "COMPLETED", "FAILED"], required: true, default: "ACTIVE", index: true },
    customerRequest: { type: String, required: true },
    finalResponse: { type: String, default: null },
    averageConfidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    resolutionQuality: { type: Number, required: true, min: 0, max: 100, default: 0 },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { collection: "agentcollaborationsessions", timestamps: true },
);

agentCollaborationSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
agentCollaborationSessionSchema.index({ organizationId: 1, conversationId: 1, createdAt: -1 });

export type AgentCollaborationSessionDocument = InferSchemaType<typeof agentCollaborationSessionSchema> & { _id: mongoose.Types.ObjectId };
export const AgentCollaborationSessionModel =
  (mongoose.models.AgentCollaborationSession ??
    mongoose.model("AgentCollaborationSession", agentCollaborationSessionSchema)) as mongoose.Model<any>;

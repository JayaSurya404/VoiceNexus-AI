import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentDelegationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    collaborationSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    taskId: { type: Schema.Types.ObjectId, required: true, index: true },
    sourceAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    targetAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    task: { type: String, required: true },
    status: { type: String, enum: ["REQUESTED", "ACCEPTED", "COMPLETED", "REJECTED", "FAILED"], required: true, default: "REQUESTED", index: true },
    reasoning: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { collection: "agentdelegations", timestamps: true },
);

agentDelegationSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
agentDelegationSchema.index({ organizationId: 1, collaborationSessionId: 1, createdAt: 1 });

export type AgentDelegationDocument = InferSchemaType<typeof agentDelegationSchema> & { _id: mongoose.Types.ObjectId };
export const AgentDelegationModel =
  (mongoose.models.AgentDelegation ?? mongoose.model("AgentDelegation", agentDelegationSchema)) as mongoose.Model<any>;

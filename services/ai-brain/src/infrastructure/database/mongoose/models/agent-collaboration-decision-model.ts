import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentCollaborationDecisionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    collaborationSessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    decisionType: {
      type: String,
      enum: ["DELEGATION", "SPECIALIST_RESULT", "SUPERVISOR_REVIEW", "CONFLICT_RESOLUTION", "FINAL_APPROVAL"],
      required: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    reasoning: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    approved: { type: Boolean, required: true, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "agentcollaborationdecisions" },
);

agentCollaborationDecisionSchema.index({ organizationId: 1, createdAt: -1 });
agentCollaborationDecisionSchema.index({ organizationId: 1, collaborationSessionId: 1, createdAt: 1 });

export type AgentCollaborationDecisionDocument = InferSchemaType<typeof agentCollaborationDecisionSchema> & { _id: mongoose.Types.ObjectId };
export const AgentCollaborationDecisionModel =
  (mongoose.models.AgentCollaborationDecision ??
    mongoose.model("AgentCollaborationDecision", agentCollaborationDecisionSchema)) as mongoose.Model<any>;

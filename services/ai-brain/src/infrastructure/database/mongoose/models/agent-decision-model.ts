import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentDecisionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    aiConversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: {
      type: String,
      enum: ["STATE_TRANSITION", "QUALIFICATION", "OBJECTION", "FOLLOWUP", "HANDOFF", "TOOL_CALL", "RESPONSE"],
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: ["GREETING", "DISCOVERY", "QUALIFICATION", "OBJECTION", "PRICING", "FOLLOWUP", "TRANSFER", "COMPLETED"],
      required: true,
    },
    decision: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    reasoning: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, index: true },
  },
  { collection: "agentdecisions" },
);

agentDecisionSchema.index({ organizationId: 1, agentSessionId: 1, createdAt: -1 });

export type AgentDecisionDocument = InferSchemaType<typeof agentDecisionSchema> & { _id: mongoose.Types.ObjectId };
export const AgentDecisionModel =
  (mongoose.models.AgentDecision ?? mongoose.model("AgentDecision", agentDecisionSchema)) as mongoose.Model<any>;

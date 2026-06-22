import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentCoachingInsightSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    coachingSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: { type: String, enum: ["OBJECTION_HANDLING", "DISCOVERY_QUESTION", "CLOSING_SUGGESTION", "FOLLOW_UP", "ESCALATION"], required: true, index: true },
    message: { type: String, required: true },
    reasoning: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    accepted: { type: Boolean, default: null },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "agentcoachinginsights" },
);

agentCoachingInsightSchema.index({ organizationId: 1, createdAt: -1 });
agentCoachingInsightSchema.index({ organizationId: 1, coachingSessionId: 1, createdAt: -1 });

export type AgentCoachingInsightDocument = InferSchemaType<typeof agentCoachingInsightSchema> & { _id: mongoose.Types.ObjectId };
export const AgentCoachingInsightModel =
  (mongoose.models.AgentCoachingInsight ??
    mongoose.model("AgentCoachingInsight", agentCoachingInsightSchema)) as mongoose.Model<any>;

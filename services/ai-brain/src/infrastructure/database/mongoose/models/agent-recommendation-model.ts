import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentRecommendationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    coachingSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: { type: String, enum: ["ASK_QUESTION", "SCHEDULE_MEETING", "SEND_FOLLOW_UP", "ESCALATE", "TRANSFER", "CLOSE_OPPORTUNITY"], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], required: true, default: "MEDIUM", index: true },
    used: { type: Boolean, required: true, default: false, index: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "agentrecommendations" },
);

agentRecommendationSchema.index({ organizationId: 1, createdAt: -1 });
agentRecommendationSchema.index({ organizationId: 1, coachingSessionId: 1, createdAt: -1 });

export type AgentRecommendationDocument = InferSchemaType<typeof agentRecommendationSchema> & { _id: mongoose.Types.ObjectId };
export const AgentRecommendationModel =
  (mongoose.models.AgentRecommendation ??
    mongoose.model("AgentRecommendation", agentRecommendationSchema)) as mongoose.Model<any>;

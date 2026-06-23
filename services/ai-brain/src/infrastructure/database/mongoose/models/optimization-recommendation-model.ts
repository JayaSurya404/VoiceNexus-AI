import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationRecommendationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ["QUEUE_BALANCING", "AGENT_REALLOCATION", "WORKFLOW_TUNING", "KNOWLEDGE_IMPROVEMENT", "REVENUE_RECOVERY", "COACHING_INTERVENTION", "SELF_HEALING"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    rationale: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    expectedImpact: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], required: true, default: "MEDIUM", index: true },
    status: { type: String, enum: ["OPEN", "ACTIONED", "DISMISSED"], required: true, default: "OPEN", index: true },
  },
  { collection: "optimizationrecommendations", timestamps: true },
);

optimizationRecommendationSchema.index({ organizationId: 1, status: 1, expectedImpact: -1 });

export type OptimizationRecommendationDocument = InferSchemaType<typeof optimizationRecommendationSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationRecommendationModel =
  (mongoose.models.OptimizationRecommendation ?? mongoose.model("OptimizationRecommendation", optimizationRecommendationSchema)) as mongoose.Model<any>;

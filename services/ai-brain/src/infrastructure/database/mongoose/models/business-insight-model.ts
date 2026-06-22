import mongoose, { Schema, type InferSchemaType } from "mongoose";

const businessInsightSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ["GROWTH_OPPORTUNITY", "PERFORMANCE_ANOMALY", "RISK_INDICATOR", "OPTIMIZATION_SUGGESTION"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    impactScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    recommendedActions: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "businessinsights", timestamps: true },
);

businessInsightSchema.index({ organizationId: 1, impactScore: -1, createdAt: -1 });

export type BusinessInsightDocument = InferSchemaType<typeof businessInsightSchema> & { _id: mongoose.Types.ObjectId };
export const BusinessInsightModel =
  (mongoose.models.BusinessInsight ?? mongoose.model("BusinessInsight", businessInsightSchema)) as mongoose.Model<any>;

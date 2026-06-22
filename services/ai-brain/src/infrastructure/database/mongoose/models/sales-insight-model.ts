import mongoose, { Schema, type InferSchemaType } from "mongoose";

const salesInsightSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ["PIPELINE_GROWTH", "RISK_CONCENTRATION", "TOP_AGENT", "LEAD_SOURCE", "UPSELL_TREND", "REVENUE_DRIVER"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Number, required: true, default: 0 },
    trend: { type: String, enum: ["UP", "DOWN", "FLAT"], required: true, default: "FLAT" },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "salesinsights", timestamps: true },
);

salesInsightSchema.index({ organizationId: 1, type: 1, createdAt: -1 });

export type SalesInsightDocument = InferSchemaType<typeof salesInsightSchema> & { _id: mongoose.Types.ObjectId };
export const SalesInsightModel =
  (mongoose.models.SalesInsight ?? mongoose.model("SalesInsight", salesInsightSchema)) as mongoose.Model<any>;

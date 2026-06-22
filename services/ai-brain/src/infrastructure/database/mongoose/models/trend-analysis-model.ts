import mongoose, { Schema, type InferSchemaType } from "mongoose";

const trendAnalysisSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    metric: { type: String, required: true, index: true },
    period: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"], required: true, index: true },
    values: { type: [{ label: String, value: Number }], default: [] },
    changePercent: { type: Number, required: true, default: 0 },
    direction: { type: String, enum: ["UP", "DOWN", "FLAT"], required: true, default: "FLAT" },
    insight: { type: String, required: true },
    computedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "trendanalyses", timestamps: true },
);

trendAnalysisSchema.index({ organizationId: 1, metric: 1, period: 1, computedAt: -1 });

export type TrendAnalysisDocument = InferSchemaType<typeof trendAnalysisSchema> & { _id: mongoose.Types.ObjectId };
export const TrendAnalysisModel =
  (mongoose.models.TrendAnalysis ?? mongoose.model("TrendAnalysis", trendAnalysisSchema)) as mongoose.Model<any>;

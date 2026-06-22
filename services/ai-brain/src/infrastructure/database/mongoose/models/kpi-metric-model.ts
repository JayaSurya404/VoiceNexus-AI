import mongoose, { Schema, type InferSchemaType } from "mongoose";

const kpiMetricSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    category: { type: String, enum: ["REVENUE", "SALES", "SUPPORT", "AI", "CONVERSION"], required: true, index: true },
    name: { type: String, required: true, index: true },
    value: { type: Number, required: true, default: 0 },
    target: { type: Number, default: null },
    unit: { type: String, required: true, default: "count" },
    trend: { type: String, enum: ["UP", "DOWN", "FLAT"], required: true, default: "FLAT" },
    period: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"], required: true, index: true },
    measuredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "kpimetrics", timestamps: true },
);

kpiMetricSchema.index({ organizationId: 1, category: 1, period: 1, measuredAt: -1 });

export type KpiMetricDocument = InferSchemaType<typeof kpiMetricSchema> & { _id: mongoose.Types.ObjectId };
export const KpiMetricModel =
  (mongoose.models.KpiMetric ?? mongoose.model("KpiMetric", kpiMetricSchema)) as mongoose.Model<any>;

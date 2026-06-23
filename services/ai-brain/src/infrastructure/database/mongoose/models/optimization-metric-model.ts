import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationMetricSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, index: true },
    scope: { type: String, enum: ["QUEUE", "AGENT", "WORKFLOW", "KNOWLEDGE", "REVENUE", "COACHING"], required: true, index: true },
    value: { type: Number, required: true, default: 0 },
    target: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: "count" },
    status: { type: String, enum: ["HEALTHY", "WATCH", "BREACHED"], required: true, default: "HEALTHY", index: true },
    measuredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "optimizationmetrics", timestamps: true },
);

optimizationMetricSchema.index({ organizationId: 1, status: 1, measuredAt: -1 });

export type OptimizationMetricDocument = InferSchemaType<typeof optimizationMetricSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationMetricModel =
  (mongoose.models.OptimizationMetric ?? mongoose.model("OptimizationMetric", optimizationMetricSchema)) as mongoose.Model<any>;

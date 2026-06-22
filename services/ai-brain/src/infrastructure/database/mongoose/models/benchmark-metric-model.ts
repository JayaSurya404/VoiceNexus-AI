import mongoose, { Schema, type InferSchemaType } from "mongoose";

const benchmarkMetricSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    scope: { type: String, enum: ["TEAM", "QUEUE", "AGENT", "ORGANIZATION"], required: true, index: true },
    metric: { type: String, required: true, index: true },
    value: { type: Number, required: true, default: 0 },
    benchmarkValue: { type: Number, required: true, default: 0 },
    percentile: { type: Number, required: true, default: 50 },
    comparison: { type: String, enum: ["ABOVE", "BELOW", "AT"], required: true, default: "AT" },
    computedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "benchmarkmetrics", timestamps: true },
);

benchmarkMetricSchema.index({ organizationId: 1, scope: 1, metric: 1, computedAt: -1 });

export type BenchmarkMetricDocument = InferSchemaType<typeof benchmarkMetricSchema> & { _id: mongoose.Types.ObjectId };
export const BenchmarkMetricModel =
  (mongoose.models.BenchmarkMetric ?? mongoose.model("BenchmarkMetric", benchmarkMetricSchema)) as mongoose.Model<any>;

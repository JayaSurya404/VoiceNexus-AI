import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationEventSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ["KPI_THRESHOLD_BREACHED", "BOTTLENECK_DETECTED", "RECOMMENDATION_GENERATED", "ACTION_CREATED", "RESULT_CAPTURED"],
      required: true,
      index: true,
    },
    source: { type: String, required: true, index: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "optimizationevents" },
);

optimizationEventSchema.index({ organizationId: 1, severity: 1, createdAt: -1 });

export type OptimizationEventDocument = InferSchemaType<typeof optimizationEventSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationEventModel =
  (mongoose.models.OptimizationEvent ?? mongoose.model("OptimizationEvent", optimizationEventSchema)) as mongoose.Model<any>;

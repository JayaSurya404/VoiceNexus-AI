import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationExperimentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    hypothesis: { type: String, required: true },
    scope: { type: String, enum: ["QUEUE", "AGENT", "WORKFLOW", "KNOWLEDGE", "REVENUE", "COACHING"], required: true, index: true },
    status: { type: String, enum: ["PLANNED", "RUNNING", "COMPLETED", "FAILED"], required: true, default: "PLANNED", index: true },
    baselineMetric: { type: Number, required: true, default: 0 },
    targetMetric: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { collection: "optimizationexperiments", timestamps: true },
);

optimizationExperimentSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export type OptimizationExperimentDocument = InferSchemaType<typeof optimizationExperimentSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationExperimentModel =
  (mongoose.models.OptimizationExperiment ?? mongoose.model("OptimizationExperiment", optimizationExperimentSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationActionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    recommendationId: { type: Schema.Types.ObjectId, default: null, index: true },
    scope: { type: String, enum: ["QUEUE", "AGENT", "WORKFLOW", "KNOWLEDGE", "REVENUE", "COACHING"], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "RUNNING", "COMPLETED", "FAILED", "DISMISSED"], required: true, default: "PENDING", index: true },
    impactScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "optimizationactions", timestamps: true },
);

optimizationActionSchema.index({ organizationId: 1, status: 1, impactScore: -1 });

export type OptimizationActionDocument = InferSchemaType<typeof optimizationActionSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationActionModel =
  (mongoose.models.OptimizationAction ?? mongoose.model("OptimizationAction", optimizationActionSchema)) as mongoose.Model<any>;

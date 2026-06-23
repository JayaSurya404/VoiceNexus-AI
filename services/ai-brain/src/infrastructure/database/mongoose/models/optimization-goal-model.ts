import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationGoalSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    scope: { type: String, enum: ["QUEUE", "AGENT", "WORKFLOW", "KNOWLEDGE", "REVENUE", "COACHING"], required: true, index: true },
    targetMetric: { type: String, required: true, index: true },
    targetValue: { type: Number, required: true, default: 0 },
    currentValue: { type: Number, required: true, default: 0 },
    dueAt: { type: Date, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "ACHIEVED", "MISSED", "PAUSED"], required: true, default: "ACTIVE", index: true },
  },
  { collection: "optimizationgoals", timestamps: true },
);

optimizationGoalSchema.index({ organizationId: 1, status: 1, dueAt: 1 });

export type OptimizationGoalDocument = InferSchemaType<typeof optimizationGoalSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationGoalModel =
  (mongoose.models.OptimizationGoal ?? mongoose.model("OptimizationGoal", optimizationGoalSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationRuleSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    scope: { type: String, enum: ["QUEUE", "AGENT", "WORKFLOW", "KNOWLEDGE", "REVENUE", "COACHING"], required: true, index: true },
    condition: { type: Schema.Types.Mixed, default: {} },
    action: { type: String, required: true },
    priority: { type: Number, required: true, default: 0, index: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "optimizationrules", timestamps: true },
);

optimizationRuleSchema.index({ organizationId: 1, active: 1, priority: -1 });

export type OptimizationRuleDocument = InferSchemaType<typeof optimizationRuleSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationRuleModel =
  (mongoose.models.OptimizationRule ?? mongoose.model("OptimizationRule", optimizationRuleSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optimizationResultSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    actionId: { type: Schema.Types.ObjectId, default: null, index: true },
    experimentId: { type: Schema.Types.ObjectId, default: null, index: true },
    metric: { type: String, required: true, index: true },
    beforeValue: { type: Number, required: true, default: 0 },
    afterValue: { type: Number, required: true, default: 0 },
    impactPercent: { type: Number, required: true, default: 0 },
    summary: { type: String, required: true },
    capturedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "optimizationresults", timestamps: true },
);

optimizationResultSchema.index({ organizationId: 1, capturedAt: -1 });

export type OptimizationResultDocument = InferSchemaType<typeof optimizationResultSchema> & { _id: mongoose.Types.ObjectId };
export const OptimizationResultModel =
  (mongoose.models.OptimizationResult ?? mongoose.model("OptimizationResult", optimizationResultSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const revenueForecastSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    period: { type: String, enum: ["MONTH", "QUARTER", "YEAR"], required: true, index: true },
    periodStart: { type: Date, required: true, index: true },
    periodEnd: { type: Date, required: true },
    pipelineValue: { type: Number, required: true, min: 0, default: 0 },
    weightedRevenue: { type: Number, required: true, min: 0, default: 0 },
    committedRevenue: { type: Number, required: true, min: 0, default: 0 },
    projectedRevenue: { type: Number, required: true, min: 0, default: 0 },
    opportunityCount: { type: Number, required: true, min: 0, default: 0 },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
  },
  { collection: "revenueforecasts", timestamps: true },
);

revenueForecastSchema.index({ organizationId: 1, period: 1, periodStart: -1 });

export type RevenueForecastDocument = InferSchemaType<typeof revenueForecastSchema> & { _id: mongoose.Types.ObjectId };
export const RevenueForecastModel =
  (mongoose.models.RevenueForecast ?? mongoose.model("RevenueForecast", revenueForecastSchema)) as mongoose.Model<any>;

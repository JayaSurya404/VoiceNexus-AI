import mongoose, { Schema, type InferSchemaType } from "mongoose";

const dealRiskSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    opportunityId: { type: Schema.Types.ObjectId, required: true, index: true },
    riskType: {
      type: String,
      enum: ["STALLED_DEAL", "LOW_ENGAGEMENT", "MISSING_FOLLOW_UP", "DECLINING_SENTIMENT", "LONG_SALES_CYCLE"],
      required: true,
      index: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    reasons: { type: [String], default: [] },
    recommendedActions: { type: [String], default: [] },
    active: { type: Boolean, required: true, default: true, index: true },
    detectedAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "dealrisks", timestamps: true },
);

dealRiskSchema.index({ organizationId: 1, active: 1, riskScore: -1 });
dealRiskSchema.index({ organizationId: 1, opportunityId: 1, riskType: 1 });

export type DealRiskDocument = InferSchemaType<typeof dealRiskSchema> & { _id: mongoose.Types.ObjectId };
export const DealRiskModel =
  (mongoose.models.DealRisk ?? mongoose.model("DealRisk", dealRiskSchema)) as mongoose.Model<any>;

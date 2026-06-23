import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    tier: { type: String, enum: ["FREE", "STARTER", "PRO", "ENTERPRISE"], required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    monthlyPriceCents: { type: Number, default: 0 },
    limits: { type: mongoose.Schema.Types.Mixed, default: {} },
    features: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

subscriptionPlanSchema.index({ organizationId: 1, tier: 1 });
subscriptionPlanSchema.index({ active: 1, monthlyPriceCents: 1 });

export const SubscriptionPlanModel: mongoose.Model<any> =
  (mongoose.models.SubscriptionPlan as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("SubscriptionPlan", subscriptionPlanSchema, "subscriptionplans");

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    tier: { type: String, enum: ["FREE", "STARTER", "PRO", "ENTERPRISE"], required: true, index: true },
    status: { type: String, enum: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "SUSPENDED"], default: "TRIALING", index: true },
    seats: { type: Number, default: 1 },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    entitlements: { type: mongoose.Schema.Types.Mixed, default: {} },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

subscriptionSchema.index({ organizationId: 1, status: 1 });
subscriptionSchema.index({ organizationId: 1, currentPeriodEnd: 1 });

export const SubscriptionModel: mongoose.Model<any> =
  (mongoose.models.Subscription as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("Subscription", subscriptionSchema, "subscriptions");

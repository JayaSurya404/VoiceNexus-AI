import mongoose from "mongoose";

const billingEventSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    billingAccountId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    type: {
      type: String,
      enum: ["INVOICE_CREATED", "PAYMENT_SUCCEEDED", "PAYMENT_FAILED", "CREDIT_APPLIED", "USAGE_CHARGED", "BALANCE_UPDATED"],
      required: true,
      index: true,
    },
    amountCents: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

billingEventSchema.index({ organizationId: 1, createdAt: -1 });

export const BillingEventModel: mongoose.Model<any> =
  (mongoose.models.BillingEvent as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("BillingEvent", billingEventSchema, "billingevents");

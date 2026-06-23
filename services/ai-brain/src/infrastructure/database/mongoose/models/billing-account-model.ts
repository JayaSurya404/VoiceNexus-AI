import mongoose from "mongoose";

const billingAccountSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    billingEmail: { type: String, required: true, lowercase: true, trim: true },
    currency: { type: String, default: "USD" },
    balanceCents: { type: Number, default: 0 },
    creditCents: { type: Number, default: 0 },
    paymentProvider: { type: String, default: null },
    providerCustomerId: { type: String, default: null, index: true },
    taxId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

billingAccountSchema.index({ organizationId: 1 }, { unique: true });

export const BillingAccountModel: mongoose.Model<any> =
  (mongoose.models.BillingAccount as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("BillingAccount", billingAccountSchema, "billingaccounts");

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    billingAccountId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"], default: "PENDING", index: true },
    amountCents: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    provider: { type: String, default: null },
    providerPaymentId: { type: String, default: null, index: true },
    failureReason: { type: String, default: null },
    paidAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

paymentSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const PaymentModel: mongoose.Model<any> =
  (mongoose.models.Payment as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("Payment", paymentSchema, "payments");

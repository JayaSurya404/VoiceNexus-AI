import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    billingAccountId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    invoiceNumber: { type: String, required: true, index: true },
    status: { type: String, enum: ["DRAFT", "OPEN", "PAID", "VOID", "UNCOLLECTIBLE"], default: "OPEN", index: true },
    currency: { type: String, default: "USD" },
    subtotalCents: { type: Number, default: 0 },
    taxCents: { type: Number, default: 0 },
    totalCents: { type: Number, default: 0 },
    balanceDueCents: { type: Number, default: 0 },
    issuedAt: { type: Date, required: true },
    dueAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    lineItems: { type: [mongoose.Schema.Types.Mixed], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

invoiceSchema.index({ organizationId: 1, status: 1, issuedAt: -1 });
invoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });

export const InvoiceModel: mongoose.Model<any> =
  (mongoose.models.Invoice as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("Invoice", invoiceSchema, "invoices");

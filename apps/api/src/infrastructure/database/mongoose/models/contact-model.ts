import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { CustomerType } from "@voicenexus/contracts";

export interface ContactDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  email: string | null;
  phone: string | null;
  preferredLanguage: string;
  timezone: string;
  customerType: CustomerType;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new mongoose.Schema<ContactDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: null, maxlength: 254 },
    phone: { type: String, trim: true, default: null, maxlength: 32 },
    preferredLanguage: { type: String, trim: true, default: "en", maxlength: 24 },
    timezone: { type: String, trim: true, default: "UTC", maxlength: 100 },
    customerType: {
      type: String,
      enum: ["LEAD", "CUSTOMER", "PARTNER", "VENDOR"],
      default: "LEAD",
      index: true,
    },
  },
  { timestamps: true },
);

contactSchema.index({ organizationId: 1, leadId: 1 }, { unique: true });

export type ContactMongoDocument = HydratedDocument<ContactDocument>;

export const ContactModel =
  (mongoose.models.Contact as Model<ContactDocument> | undefined) ??
  mongoose.model<ContactDocument>("Contact", contactSchema);

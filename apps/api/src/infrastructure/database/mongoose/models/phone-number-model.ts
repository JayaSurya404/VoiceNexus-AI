import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { TelephonyProvider } from "@voicenexus/contracts";

export interface PhoneNumberDocument {
  organizationId: Types.ObjectId;
  provider: TelephonyProvider;
  phoneNumber: string;
  label: string;
  providerSid: string | null;
  status: "ACTIVE" | "INACTIVE";
  capabilities: {
    voice: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const phoneNumberSchema = new mongoose.Schema<PhoneNumberDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    provider: { type: String, enum: ["TWILIO", "EXOTEL"], required: true, default: "TWILIO", index: true },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 32, index: true },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    providerSid: { type: String, trim: true, default: null, maxlength: 80 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true, default: "ACTIVE", index: true },
    capabilities: {
      voice: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

phoneNumberSchema.index({ organizationId: 1, phoneNumber: 1 }, { unique: true });

export type PhoneNumberMongoDocument = HydratedDocument<PhoneNumberDocument>;

export const PhoneNumberModel =
  (mongoose.models.PhoneNumber as Model<PhoneNumberDocument> | undefined) ??
  mongoose.model<PhoneNumberDocument>("PhoneNumber", phoneNumberSchema);

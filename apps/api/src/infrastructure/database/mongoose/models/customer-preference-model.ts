import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface CustomerPreferenceDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  language: string;
  timezone: string;
  preferredContactTime: string;
  communicationStyle: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerPreferenceSchema = new mongoose.Schema<CustomerPreferenceDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    language: { type: String, trim: true, default: "en", maxlength: 24 },
    timezone: { type: String, trim: true, default: "UTC", maxlength: 100 },
    preferredContactTime: { type: String, trim: true, default: "Business hours", maxlength: 120 },
    communicationStyle: { type: String, trim: true, default: "Friendly and concise", maxlength: 500 },
  },
  { timestamps: true },
);

customerPreferenceSchema.index({ organizationId: 1, leadId: 1 }, { unique: true });

export type CustomerPreferenceMongoDocument = HydratedDocument<CustomerPreferenceDocument>;

export const CustomerPreferenceModel =
  (mongoose.models.CustomerPreference as Model<CustomerPreferenceDocument> | undefined) ??
  mongoose.model<CustomerPreferenceDocument>("CustomerPreference", customerPreferenceSchema);

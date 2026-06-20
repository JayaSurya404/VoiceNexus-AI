import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { OrganizationStatus } from "../../../../domain/entities/organization.js";

export interface OrganizationDocument {
  name: string;
  slug: string;
  status: OrganizationStatus;
  timezone: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new mongoose.Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 140,
      index: true,
    },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE", index: true },
    timezone: { type: String, required: true, default: "UTC", maxlength: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

export type OrganizationMongoDocument = HydratedDocument<OrganizationDocument>;

export const OrganizationModel =
  (mongoose.models.Organization as Model<OrganizationDocument> | undefined) ??
  mongoose.model<OrganizationDocument>("Organization", organizationSchema);

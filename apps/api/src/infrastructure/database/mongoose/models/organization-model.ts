import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";

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

const organizationSchema = new Schema<OrganizationDocument>(
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

organizationSchema.index({ slug: 1 }, { unique: true });

export type OrganizationMongoDocument = HydratedDocument<OrganizationDocument>;

export const OrganizationModel =
  (models.Organization as Model<OrganizationDocument> | undefined) ??
  model<OrganizationDocument>("Organization", organizationSchema);

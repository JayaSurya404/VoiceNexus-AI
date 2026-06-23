import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"], default: "TRIAL", index: true },
    ownerUserId: { type: String, default: null, index: true },
    primaryEmail: { type: String, default: null, lowercase: true, trim: true },
    timezone: { type: String, default: "UTC" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ status: 1, createdAt: -1 });

export const OrganizationModel: mongoose.Model<any> =
  (mongoose.models.Organization as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("Organization", organizationSchema, "organizations");

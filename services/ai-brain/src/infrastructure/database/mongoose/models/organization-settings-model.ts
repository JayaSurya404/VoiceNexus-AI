import mongoose from "mongoose";

const organizationSettingsSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    defaultLocale: { type: String, default: "en-US" },
    timezone: { type: String, default: "UTC" },
    dataRetentionDays: { type: Number, default: 365 },
    allowedDomains: { type: [String], default: [] },
    security: {
      ssoRequired: { type: Boolean, default: false },
      mfaRequired: { type: Boolean, default: false },
      apiKeyRotationDays: { type: Number, default: 90 },
    },
    notifications: {
      billingAlerts: { type: Boolean, default: true },
      usageAlerts: { type: Boolean, default: true },
      auditAlerts: { type: Boolean, default: true },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

organizationSettingsSchema.index({ organizationId: 1 }, { unique: true });

export const OrganizationSettingsModel: mongoose.Model<any> =
  (mongoose.models.OrganizationSettings as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("OrganizationSettings", organizationSettingsSchema, "organizationsettings");

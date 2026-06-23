import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    key: {
      type: String,
      enum: ["ai_calling", "whatsapp", "crm", "memory", "automation", "analytics", "rag", "optimization"],
      required: true,
      index: true,
    },
    enabled: { type: Boolean, default: false, index: true },
    rolloutPercentage: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

featureFlagSchema.index({ organizationId: 1, key: 1 }, { unique: true });

export const FeatureFlagModel: mongoose.Model<any> =
  (mongoose.models.FeatureFlag as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("FeatureFlag", featureFlagSchema, "featureflags");

import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["SECRET", "PUBLIC"], required: true, index: true },
    keyPrefix: { type: String, required: true, index: true },
    keyHash: { type: String, required: true },
    scopes: { type: [String], default: [] },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null, index: true },
    createdBy: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

apiKeySchema.index({ organizationId: 1, revokedAt: 1 });
apiKeySchema.index({ organizationId: 1, keyPrefix: 1 });

export const ApiKeyModel: mongoose.Model<any> =
  (mongoose.models.ApiKey as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("ApiKey", apiKeySchema, "apikeys");

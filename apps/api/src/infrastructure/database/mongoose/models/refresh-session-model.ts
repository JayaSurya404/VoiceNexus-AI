import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface RefreshSessionDocument {
  tokenId: string;
  familyId: string;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const refreshSessionSchema = new mongoose.Schema<RefreshSessionDocument>(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    familyId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null, index: true },
    replacedByTokenId: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 512 },
    ipHash: { type: String, default: null },
  },
  { timestamps: true },
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshSessionSchema.index({ userId: 1, familyId: 1 });

export type RefreshSessionMongoDocument = HydratedDocument<RefreshSessionDocument>;

export const RefreshSessionModel =
  (mongoose.models.RefreshSession as Model<RefreshSessionDocument> | undefined) ??
  mongoose.model<RefreshSessionDocument>("RefreshSession", refreshSessionSchema);

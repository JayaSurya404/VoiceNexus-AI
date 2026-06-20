import mongoose, { type HydratedDocument, type Model } from "mongoose";

import type { PlatformRole } from "@voicenexus/contracts";
import type { UserStatus } from "../../../../domain/entities/user.js";

export interface UserDocument {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  platformRole: PlatformRole | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true, select: false },
    platformRole: { type: String, enum: ["SUPER_ADMIN"], default: null },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE", index: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type UserMongoDocument = HydratedDocument<UserDocument>;

export const UserModel =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);

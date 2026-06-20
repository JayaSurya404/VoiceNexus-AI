import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";

import type { OrganizationRole } from "@voicenexus/contracts";
import type { MembershipStatus } from "../../../../domain/entities/organization-member.js";

export interface OrganizationMemberDocument {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrganizationRole;
  status: MembershipStatus;
  invitedBy: Types.ObjectId | null;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const organizationMemberSchema = new Schema<OrganizationMemberDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["OWNER", "MANAGER", "AGENT"], required: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE", index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    joinedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
organizationMemberSchema.index({ userId: 1, status: 1 });

export type OrganizationMemberMongoDocument = HydratedDocument<OrganizationMemberDocument>;

export const OrganizationMemberModel =
  (models.OrganizationMember as Model<OrganizationMemberDocument> | undefined) ??
  model<OrganizationMemberDocument>("OrganizationMember", organizationMemberSchema);

import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface OrganizationMemberDocument {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "OWNER" | "MANAGER" | "AGENT";
  status: "ACTIVE" | "INVITED" | "REMOVED";
}

const organizationMemberSchema = new mongoose.Schema<OrganizationMemberDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["OWNER", "MANAGER", "AGENT"], required: true },
    status: { type: String, enum: ["ACTIVE", "INVITED", "REMOVED"], required: true, default: "INVITED" },
  },
  { timestamps: true },
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export type OrganizationMemberMongoDocument = HydratedDocument<OrganizationMemberDocument>;

export const OrganizationMemberModel =
  (mongoose.models.OrganizationMember as Model<OrganizationMemberDocument> | undefined) ??
  mongoose.model<OrganizationMemberDocument>("OrganizationMember", organizationMemberSchema);

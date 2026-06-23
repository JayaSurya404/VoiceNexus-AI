import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    actorId: { type: String, default: null, index: true },
    actorType: { type: String, enum: ["USER", "SYSTEM", "API_KEY", "SERVICE"], default: "USER", index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, default: null, index: true },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, resourceType: 1, resourceId: 1 });

export const AuditLogModel: mongoose.Model<any> =
  (mongoose.models.AuditLog as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("AuditLog", auditLogSchema, "auditlogs");

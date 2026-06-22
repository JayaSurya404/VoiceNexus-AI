import mongoose, { Schema, type InferSchemaType } from "mongoose";

const complianceAlertSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    coachingSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: { type: String, enum: ["MISSING_DISCLOSURE", "SCRIPT_VIOLATION", "COMPLIANCE_RISK", "ESCALATION_REQUIRED"], required: true, index: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true, index: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, required: true, default: false, index: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "compliancealerts" },
);

complianceAlertSchema.index({ organizationId: 1, createdAt: -1 });
complianceAlertSchema.index({ organizationId: 1, resolved: 1, severity: 1 });

export type ComplianceAlertDocument = InferSchemaType<typeof complianceAlertSchema> & { _id: mongoose.Types.ObjectId };
export const ComplianceAlertModel =
  (mongoose.models.ComplianceAlert ??
    mongoose.model("ComplianceAlert", complianceAlertSchema)) as mongoose.Model<any>;

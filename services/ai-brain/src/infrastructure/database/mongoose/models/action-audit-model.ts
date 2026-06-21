import mongoose, { Schema, type InferSchemaType } from "mongoose";

const actionAuditSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    workflowExecutionId: { type: Schema.Types.ObjectId, default: null, index: true },
    workflowActionId: { type: Schema.Types.ObjectId, default: null, index: true },
    actionType: { type: String, required: true, index: true },
    toolName: { type: String, required: true, index: true },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["SUCCESS", "FAILED", "SKIPPED"], required: true, index: true },
    reasoning: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    createdAt: { type: Date, required: true, index: true },
  },
  { collection: "actionaudits" },
);

actionAuditSchema.index({ organizationId: 1, createdAt: -1 });
actionAuditSchema.index({ organizationId: 1, sessionId: 1, createdAt: -1 });

export type ActionAuditDocument = InferSchemaType<typeof actionAuditSchema> & { _id: mongoose.Types.ObjectId };
export const ActionAuditModel =
  (mongoose.models.ActionAudit ?? mongoose.model("ActionAudit", actionAuditSchema)) as mongoose.Model<any>;

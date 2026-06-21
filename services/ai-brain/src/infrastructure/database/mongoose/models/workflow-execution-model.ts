import mongoose, { Schema, type InferSchemaType } from "mongoose";

const workflowExecutionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    trigger: { type: String, enum: ["TRANSCRIPT_FINAL", "MANUAL", "SYSTEM"], required: true },
    status: { type: String, enum: ["PLANNED", "RUNNING", "COMPLETED", "FAILED", "PARTIAL"], required: true, index: true },
    plannedActions: { type: [String], default: [] },
    completedActions: { type: Number, default: 0 },
    failedActions: { type: Number, default: 0 },
    reasoning: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { collection: "workflowexecutions", timestamps: true },
);

workflowExecutionSchema.index({ organizationId: 1, createdAt: -1 });
workflowExecutionSchema.index({ organizationId: 1, agentSessionId: 1, createdAt: -1 });

export type WorkflowExecutionDocument = InferSchemaType<typeof workflowExecutionSchema> & { _id: mongoose.Types.ObjectId };
export const WorkflowExecutionModel =
  (mongoose.models.WorkflowExecution ?? mongoose.model("WorkflowExecution", workflowExecutionSchema)) as mongoose.Model<any>;

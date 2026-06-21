import mongoose, { Schema, type InferSchemaType } from "mongoose";

const workflowActionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    workflowExecutionId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    actionType: {
      type: String,
      enum: [
        "CREATE_NOTE",
        "CREATE_ACTIVITY",
        "UPDATE_LEAD",
        "UPDATE_CONTACT",
        "ADD_MEMORY",
        "UPDATE_PREFERENCE",
        "CREATE_TIMELINE_EVENT",
        "SCHEDULE_FOLLOWUP",
        "TRIGGER_HANDOFF",
        "NO_ACTION",
      ],
      required: true,
      index: true,
    },
    toolName: { type: String, required: true, index: true },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "SKIPPED"], required: true, index: true },
    reasoning: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    error: { type: String, default: null },
  },
  { collection: "workflowactions", timestamps: true },
);

workflowActionSchema.index({ organizationId: 1, createdAt: -1 });
workflowActionSchema.index({ organizationId: 1, workflowExecutionId: 1, createdAt: 1 });

export type WorkflowActionDocument = InferSchemaType<typeof workflowActionSchema> & { _id: mongoose.Types.ObjectId };
export const WorkflowActionModel =
  (mongoose.models.WorkflowAction ?? mongoose.model("WorkflowAction", workflowActionSchema)) as mongoose.Model<any>;

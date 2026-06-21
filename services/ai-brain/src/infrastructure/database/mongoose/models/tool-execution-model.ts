import mongoose, { Schema, type InferSchemaType } from "mongoose";

const toolExecutionSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    toolName: { type: String, required: true, index: true },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    success: { type: Boolean, required: true },
    error: { type: String, default: null },
    executedAt: { type: Date, required: true, index: true },
  },
  { collection: "toolexecutions" },
);

toolExecutionSchema.index({ agentSessionId: 1, executedAt: -1 });
toolExecutionSchema.index({ conversationId: 1, executedAt: -1 });

export type ToolExecutionDocument = InferSchemaType<typeof toolExecutionSchema> & { _id: mongoose.Types.ObjectId };
export const ToolExecutionModel =
  (mongoose.models.ToolExecution ?? mongoose.model("ToolExecution", toolExecutionSchema)) as mongoose.Model<any>;

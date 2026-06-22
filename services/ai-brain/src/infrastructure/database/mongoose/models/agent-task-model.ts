import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentTaskSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    collaborationSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    teamId: { type: Schema.Types.ObjectId, default: null, index: true },
    assignedAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    assignedAgentType: {
      type: String,
      enum: ["SalesAgent", "SupportAgent", "TechnicalAgent", "SchedulerAgent", "QAAgent", "SupervisorAgent"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"], required: true, default: "PENDING", index: true },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: {} },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
  },
  { collection: "agenttasks", timestamps: true },
);

agentTaskSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
agentTaskSchema.index({ organizationId: 1, collaborationSessionId: 1, createdAt: 1 });

export type AgentTaskDocument = InferSchemaType<typeof agentTaskSchema> & { _id: mongoose.Types.ObjectId };
export const AgentTaskModel =
  (mongoose.models.AgentTask ?? mongoose.model("AgentTask", agentTaskSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const teamAgentSchema = new Schema(
  {
    agentId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["SalesAgent", "SupportAgent", "TechnicalAgent", "SchedulerAgent", "QAAgent", "SupervisorAgent"],
      required: true,
    },
    role: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const agentTeamSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    agents: { type: [teamAgentSchema], default: [] },
    objectives: { type: [String], default: [] },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "agentteams", timestamps: true },
);

agentTeamSchema.index({ organizationId: 1, name: 1 }, { unique: true });
agentTeamSchema.index({ organizationId: 1, active: 1, updatedAt: -1 });

export type AgentTeamDocument = InferSchemaType<typeof agentTeamSchema> & { _id: mongoose.Types.ObjectId };
export const AgentTeamModel =
  (mongoose.models.AgentTeam ?? mongoose.model("AgentTeam", agentTeamSchema)) as mongoose.Model<any>;

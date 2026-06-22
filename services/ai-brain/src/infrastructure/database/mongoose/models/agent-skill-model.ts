import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentSkillSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    skill: { type: String, required: true, trim: true, uppercase: true, index: true },
    level: { type: Number, required: true, min: 1, max: 5, default: 1 },
    certified: { type: Boolean, required: true, default: false },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "agentskills", timestamps: true },
);

agentSkillSchema.index({ organizationId: 1, agentId: 1, skill: 1 }, { unique: true });
agentSkillSchema.index({ organizationId: 1, skill: 1, active: 1, level: -1 });

export type AgentSkillDocument = InferSchemaType<typeof agentSkillSchema> & { _id: mongoose.Types.ObjectId };
export const AgentSkillModel =
  (mongoose.models.AgentSkill ?? mongoose.model("AgentSkill", agentSkillSchema)) as mongoose.Model<any>;

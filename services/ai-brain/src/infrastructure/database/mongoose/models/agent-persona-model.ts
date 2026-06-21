import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentPersonaSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["SALES_AGENT", "SUPPORT_AGENT", "APPOINTMENT_SETTER", "COLLECTIONS_AGENT"],
      required: true,
      index: true,
    },
    systemPrompt: { type: String, required: true },
    tone: { type: String, required: true },
    goals: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false, index: true },
  },
  { collection: "agentpersonas", timestamps: true },
);

agentPersonaSchema.index({ organizationId: 1, name: 1 }, { unique: true });
agentPersonaSchema.index({ organizationId: 1, isDefault: 1 });

export type AgentPersonaDocument = InferSchemaType<typeof agentPersonaSchema> & { _id: mongoose.Types.ObjectId };
export const AgentPersonaModel =
  (mongoose.models.AgentPersona ?? mongoose.model("AgentPersona", agentPersonaSchema)) as mongoose.Model<any>;

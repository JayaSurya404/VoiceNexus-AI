import mongoose, { Schema, type InferSchemaType } from "mongoose";

const humanAgentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["AGENT", "SUPERVISOR", "MANAGER"], required: true, default: "AGENT" },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE", "BREAK"], required: true, default: "OFFLINE", index: true },
    activeSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    skills: { type: [String], default: [] },
  },
  { collection: "agents", timestamps: true },
);

humanAgentSchema.index({ organizationId: 1, email: 1 }, { unique: true });
humanAgentSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type HumanAgentDocument = InferSchemaType<typeof humanAgentSchema> & { _id: mongoose.Types.ObjectId };
export const HumanAgentModel =
  (mongoose.models.HumanAgent ?? mongoose.model("HumanAgent", humanAgentSchema)) as mongoose.Model<any>;

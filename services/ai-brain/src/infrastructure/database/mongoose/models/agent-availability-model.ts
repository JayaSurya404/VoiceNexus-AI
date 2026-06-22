import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentAvailabilitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE", "BREAK"], required: true, index: true },
    statusReason: { type: String, default: null },
    capacity: { type: Number, required: true, min: 1, default: 1 },
    activeSessionCount: { type: Number, required: true, min: 0, default: 0 },
    updatedAt: { type: Date, required: true },
  },
  { collection: "agentavailabilities" },
);

agentAvailabilitySchema.index({ organizationId: 1, agentId: 1 }, { unique: true });
agentAvailabilitySchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type AgentAvailabilityDocument = InferSchemaType<typeof agentAvailabilitySchema> & {
  _id: mongoose.Types.ObjectId;
};
export const AgentAvailabilityModel =
  (mongoose.models.AgentAvailability ??
    mongoose.model("AgentAvailability", agentAvailabilitySchema)) as mongoose.Model<any>;

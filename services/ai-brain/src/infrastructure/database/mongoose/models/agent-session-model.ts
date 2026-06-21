import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentPersonaId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    aiConversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "PAUSED", "TRANSFERRED", "COMPLETED", "FAILED"], required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    lastTranscriptAt: { type: Date, default: null },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { collection: "agentsessions", timestamps: true },
);

agentSessionSchema.index({ organizationId: 1, callId: 1 }, { unique: true, sparse: true });
agentSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type AgentSessionDocument = InferSchemaType<typeof agentSessionSchema> & { _id: mongoose.Types.ObjectId };
export const AgentSessionModel =
  (mongoose.models.AgentSession ?? mongoose.model("AgentSession", agentSessionSchema)) as mongoose.Model<any>;

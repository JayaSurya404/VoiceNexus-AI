import mongoose, { Schema, type InferSchemaType } from "mongoose";

const humanAgentSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    aiSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["JOINED", "ACTIVE", "ENDED"], required: true, default: "JOINED", index: true },
    controller: { type: String, enum: ["AI", "HUMAN", "SUPERVISOR"], required: true, default: "AI" },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date, default: null },
  },
  { collection: "humanagentsessions", timestamps: true },
);

humanAgentSessionSchema.index({ organizationId: 1, agentId: 1, status: 1 });
humanAgentSessionSchema.index({ organizationId: 1, aiSessionId: 1, status: 1 });

export type HumanAgentSessionDocument = InferSchemaType<typeof humanAgentSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const HumanAgentSessionModel =
  (mongoose.models.HumanAgentSession ??
    mongoose.model("HumanAgentSession", humanAgentSessionSchema)) as mongoose.Model<any>;

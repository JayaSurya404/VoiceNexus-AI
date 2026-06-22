import mongoose, { Schema, type InferSchemaType } from "mongoose";

const queueMemberSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    queueId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ["AGENT", "SUPERVISOR"], required: true, default: "AGENT" },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "queuemembers", timestamps: true },
);

queueMemberSchema.index({ organizationId: 1, queueId: 1, agentId: 1 }, { unique: true });
queueMemberSchema.index({ organizationId: 1, agentId: 1, active: 1 });

export type QueueMemberDocument = InferSchemaType<typeof queueMemberSchema> & { _id: mongoose.Types.ObjectId };
export const QueueMemberModel =
  (mongoose.models.QueueMember ?? mongoose.model("QueueMember", queueMemberSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const queueSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    queueId: { type: Schema.Types.ObjectId, required: true, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    aiSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    assignedAgentId: { type: Schema.Types.ObjectId, default: null, index: true },
    priority: { type: Number, required: true, min: 0, default: 0, index: true },
    status: {
      type: String,
      enum: ["WAITING", "ASSIGNED", "TRANSFERRED", "COMPLETED", "ABANDONED"],
      required: true,
      default: "WAITING",
      index: true,
    },
    source: { type: String, enum: ["AI", "AGENT", "QUEUE", "MANUAL"], required: true, default: "AI" },
    routingReason: { type: String, default: null },
    escalationPath: { type: [Schema.Types.ObjectId], default: [] },
    enteredAt: { type: Date, required: true, default: Date.now, index: true },
    assignedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    abandonedAt: { type: Date, default: null },
  },
  { collection: "queuesessions", timestamps: true },
);

queueSessionSchema.index({ organizationId: 1, status: 1, priority: -1, enteredAt: 1 });
queueSessionSchema.index({ organizationId: 1, assignedAgentId: 1, status: 1 });
queueSessionSchema.index({ organizationId: 1, queueId: 1, status: 1, enteredAt: 1 });

export type QueueSessionDocument = InferSchemaType<typeof queueSessionSchema> & { _id: mongoose.Types.ObjectId };
export const QueueSessionModel =
  (mongoose.models.QueueSession ?? mongoose.model("QueueSession", queueSessionSchema)) as mongoose.Model<any>;

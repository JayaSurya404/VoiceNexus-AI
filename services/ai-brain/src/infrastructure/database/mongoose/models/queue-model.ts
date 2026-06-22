import mongoose, { Schema, type InferSchemaType } from "mongoose";

const queueSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    priority: { type: Number, required: true, min: 0, default: 0, index: true },
    maxWaitingTime: { type: Number, required: true, min: 0, default: 300 },
    overflowQueueId: { type: Schema.Types.ObjectId, default: null, index: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "queues", timestamps: true },
);

queueSchema.index({ organizationId: 1, name: 1 }, { unique: true });
queueSchema.index({ organizationId: 1, active: 1, priority: -1 });

export type QueueDocument = InferSchemaType<typeof queueSchema> & { _id: mongoose.Types.ObjectId };
export const QueueModel =
  (mongoose.models.Queue ?? mongoose.model("Queue", queueSchema)) as mongoose.Model<any>;

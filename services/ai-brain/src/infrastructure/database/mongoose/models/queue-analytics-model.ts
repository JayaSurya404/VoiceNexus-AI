import mongoose, { Schema, type InferSchemaType } from "mongoose";

const queueAnalyticsSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    queueId: { type: Schema.Types.ObjectId, required: true, index: true },
    waitTime: { type: Number, required: true, min: 0, default: 0 },
    abandonmentRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
    transferRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
    escalationRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
    resolutionRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
    sessionsHandled: { type: Number, required: true, min: 0, default: 0 },
    computedAt: { type: Date, required: true, index: true },
  },
  { collection: "queueanalytics", timestamps: true },
);

queueAnalyticsSchema.index({ organizationId: 1, queueId: 1 }, { unique: true });
queueAnalyticsSchema.index({ organizationId: 1, computedAt: -1 });

export type QueueAnalyticsDocument = InferSchemaType<typeof queueAnalyticsSchema> & { _id: mongoose.Types.ObjectId };
export const QueueAnalyticsModel =
  (mongoose.models.QueueAnalytics ??
    mongoose.model("QueueAnalytics", queueAnalyticsSchema)) as mongoose.Model<any>;

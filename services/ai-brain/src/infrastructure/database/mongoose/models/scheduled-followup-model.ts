import mongoose, { Schema, type InferSchemaType } from "mongoose";

const scheduledFollowupSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, default: null, index: true },
    followupDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], required: true, index: true },
    status: { type: String, enum: ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"], required: true, index: true },
    completedAt: { type: Date, default: null },
  },
  { collection: "scheduledfollowups", timestamps: true },
);

scheduledFollowupSchema.index({ organizationId: 1, status: 1, followupDate: 1 });
scheduledFollowupSchema.index({ organizationId: 1, leadId: 1, followupDate: -1 });

export type ScheduledFollowupDocument = InferSchemaType<typeof scheduledFollowupSchema> & { _id: mongoose.Types.ObjectId };
export const ScheduledFollowupModel =
  (mongoose.models.ScheduledFollowup ?? mongoose.model("ScheduledFollowup", scheduledFollowupSchema)) as mongoose.Model<any>;

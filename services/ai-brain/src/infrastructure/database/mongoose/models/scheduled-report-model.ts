import mongoose, { Schema, type InferSchemaType } from "mongoose";

const scheduledReportSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, default: null, index: true },
    name: { type: String, required: true },
    frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"], required: true, index: true },
    recipients: { type: [String], default: [] },
    nextRunAt: { type: Date, required: true, index: true },
    lastRunAt: { type: Date, default: null },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "scheduledreports", timestamps: true },
);

scheduledReportSchema.index({ organizationId: 1, active: 1, nextRunAt: 1 });

export type ScheduledReportDocument = InferSchemaType<typeof scheduledReportSchema> & { _id: mongoose.Types.ObjectId };
export const ScheduledReportModel =
  (mongoose.models.ScheduledReport ?? mongoose.model("ScheduledReport", scheduledReportSchema)) as mongoose.Model<any>;

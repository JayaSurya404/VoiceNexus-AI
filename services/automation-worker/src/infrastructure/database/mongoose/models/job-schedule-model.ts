import mongoose, { Schema, type InferSchemaType } from "mongoose";

const jobScheduleSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    jobType: { type: String, enum: ["FOLLOWUP", "WORKFLOW_ACTION", "WORKFLOW"], required: true, index: true },
    sourceType: { type: String, enum: ["SCHEDULED_FOLLOWUP", "WORKFLOW_ACTION", "WORKFLOW_EXECUTION"], required: true, index: true },
    sourceId: { type: Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "RETRYING", "CANCELLED"], required: true, index: true },
    runAt: { type: Date, required: true, index: true },
    maxRetries: { type: Number, required: true },
    retryDelaySeconds: { type: Number, required: true },
    attemptCount: { type: Number, required: true, default: 0 },
    lastError: { type: String, default: null },
    lockedAt: { type: Date, default: null },
    lockedBy: { type: String, default: null },
  },
  { collection: "jobschedules", timestamps: true },
);

jobScheduleSchema.index({ organizationId: 1, status: 1, runAt: 1 });
jobScheduleSchema.index({ sourceType: 1, sourceId: 1 }, { unique: true });

export type JobScheduleDocument = InferSchemaType<typeof jobScheduleSchema> & { _id: mongoose.Types.ObjectId };
export const JobScheduleModel =
  (mongoose.models.JobSchedule ?? mongoose.model("JobSchedule", jobScheduleSchema)) as mongoose.Model<any>;

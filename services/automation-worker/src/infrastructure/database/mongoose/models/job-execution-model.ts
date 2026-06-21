import mongoose, { Schema, type InferSchemaType } from "mongoose";

const jobExecutionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    jobScheduleId: { type: Schema.Types.ObjectId, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    jobType: { type: String, enum: ["FOLLOWUP", "WORKFLOW_ACTION", "WORKFLOW"], required: true, index: true },
    status: { type: String, enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "RETRYING", "CANCELLED"], required: true, index: true },
    attemptNumber: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    executionTimeMs: { type: Number, default: null },
    error: { type: String, default: null },
  },
  { collection: "jobexecutions", timestamps: true },
);

jobExecutionSchema.index({ organizationId: 1, createdAt: -1 });
jobExecutionSchema.index({ jobScheduleId: 1, attemptNumber: 1 });

export type JobExecutionDocument = InferSchemaType<typeof jobExecutionSchema> & { _id: mongoose.Types.ObjectId };
export const JobExecutionModel =
  (mongoose.models.JobExecution ?? mongoose.model("JobExecution", jobExecutionSchema)) as mongoose.Model<any>;

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const jobResultSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    jobExecutionId: { type: Schema.Types.ObjectId, required: true, index: true },
    jobScheduleId: { type: Schema.Types.ObjectId, required: true, index: true },
    success: { type: Boolean, required: true, index: true },
    output: { type: Schema.Types.Mixed, default: {} },
    error: { type: String, default: null },
    createdAt: { type: Date, required: true, index: true },
  },
  { collection: "jobresults" },
);

jobResultSchema.index({ organizationId: 1, createdAt: -1 });

export type JobResultDocument = InferSchemaType<typeof jobResultSchema> & { _id: mongoose.Types.ObjectId };
export const JobResultModel =
  (mongoose.models.JobResult ?? mongoose.model("JobResult", jobResultSchema)) as mongoose.Model<any>;

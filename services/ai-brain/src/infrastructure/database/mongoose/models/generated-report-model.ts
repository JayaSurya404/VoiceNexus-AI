import mongoose, { Schema, type InferSchemaType } from "mongoose";

const generatedReportSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, default: null, index: true },
    scheduledReportId: { type: Schema.Types.ObjectId, default: null, index: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["GENERATED", "FAILED"], required: true, default: "GENERATED", index: true },
    summary: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    generatedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "generatedreports", timestamps: true },
);

generatedReportSchema.index({ organizationId: 1, generatedAt: -1 });

export type GeneratedReportDocument = InferSchemaType<typeof generatedReportSchema> & { _id: mongoose.Types.ObjectId };
export const GeneratedReportModel =
  (mongoose.models.GeneratedReport ?? mongoose.model("GeneratedReport", generatedReportSchema)) as mongoose.Model<any>;

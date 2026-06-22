import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reportExportSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    reportId: { type: Schema.Types.ObjectId, default: null, index: true },
    format: { type: String, enum: ["CSV", "XLSX", "PDF"], required: true, index: true },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], required: true, default: "PENDING", index: true },
    fileName: { type: String, required: true },
    downloadUrl: { type: String, default: null },
    requestedBy: { type: Schema.Types.ObjectId, default: null, index: true },
  },
  { collection: "reportexports", timestamps: true },
);

reportExportSchema.index({ organizationId: 1, createdAt: -1 });

export type ReportExportDocument = InferSchemaType<typeof reportExportSchema> & { _id: mongoose.Types.ObjectId };
export const ReportExportModel =
  (mongoose.models.ReportExport ?? mongoose.model("ReportExport", reportExportSchema)) as mongoose.Model<any>;

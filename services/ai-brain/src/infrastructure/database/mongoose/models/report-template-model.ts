import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reportTemplateSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    type: { type: String, enum: ["EXECUTIVE", "KPI", "TREND", "BENCHMARK", "CUSTOM"], required: true, index: true },
    sections: { type: [String], default: [] },
    filters: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, required: true, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, default: null, index: true },
  },
  { collection: "reporttemplates", timestamps: true },
);

reportTemplateSchema.index({ organizationId: 1, active: 1, type: 1 });

export type ReportTemplateDocument = InferSchemaType<typeof reportTemplateSchema> & { _id: mongoose.Types.ObjectId };
export const ReportTemplateModel =
  (mongoose.models.ReportTemplate ?? mongoose.model("ReportTemplate", reportTemplateSchema)) as mongoose.Model<any>;

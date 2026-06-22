import mongoose, { Schema, type InferSchemaType } from "mongoose";

const executiveSummarySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    highlights: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    sourceSections: { type: [String], default: [] },
    generatedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "executivesummaries", timestamps: true },
);

executiveSummarySchema.index({ organizationId: 1, generatedAt: -1 });

export type ExecutiveSummaryDocument = InferSchemaType<typeof executiveSummarySchema> & { _id: mongoose.Types.ObjectId };
export const ExecutiveSummaryModel =
  (mongoose.models.ExecutiveSummary ?? mongoose.model("ExecutiveSummary", executiveSummarySchema)) as mongoose.Model<any>;

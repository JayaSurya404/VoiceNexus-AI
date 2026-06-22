import mongoose, { Schema, type InferSchemaType } from "mongoose";

const winLossAnalysisSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    opportunityId: { type: Schema.Types.ObjectId, required: true, index: true },
    outcome: { type: String, enum: ["WIN", "LOSS"], required: true, index: true },
    reason: { type: String, required: true },
    competitors: { type: [String], default: [] },
    successFactors: { type: [String], default: [] },
    failureFactors: { type: [String], default: [] },
    improvementSuggestions: { type: [String], default: [] },
    analyzedAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "winlossanalyses", timestamps: true },
);

winLossAnalysisSchema.index({ organizationId: 1, outcome: 1, analyzedAt: -1 });
winLossAnalysisSchema.index({ organizationId: 1, opportunityId: 1 }, { unique: true });

export type WinLossAnalysisDocument = InferSchemaType<typeof winLossAnalysisSchema> & { _id: mongoose.Types.ObjectId };
export const WinLossAnalysisModel =
  (mongoose.models.WinLossAnalysis ?? mongoose.model("WinLossAnalysis", winLossAnalysisSchema)) as mongoose.Model<any>;

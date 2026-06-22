import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeImprovementSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    knowledgeQualityScore: { type: Number, required: true, min: 0, max: 100 },
    coverageScore: { type: Number, required: true, min: 0, max: 100 },
    retrievalSuccessRate: { type: Number, required: true, min: 0, max: 1 },
    gapSeverityScore: { type: Number, required: true, min: 0, max: 100 },
    feedbackCount: { type: Number, required: true, min: 0 },
    openGapCount: { type: Number, required: true, min: 0 },
    suggestionCount: { type: Number, required: true, min: 0 },
    computedAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "knowledgeimprovements" },
);

knowledgeImprovementSchema.index({ organizationId: 1, computedAt: -1 });

export type KnowledgeImprovementDocument = InferSchemaType<typeof knowledgeImprovementSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeImprovementModel =
  (mongoose.models.KnowledgeImprovement ??
    mongoose.model("KnowledgeImprovement", knowledgeImprovementSchema)) as mongoose.Model<any>;

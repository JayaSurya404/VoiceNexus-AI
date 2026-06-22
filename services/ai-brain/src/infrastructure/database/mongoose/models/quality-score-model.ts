import mongoose, { Schema, type InferSchemaType } from "mongoose";

const qualityScoreSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    greetingQuality: { type: Number, required: true, min: 0, max: 100 },
    discoveryQuality: { type: Number, required: true, min: 0, max: 100 },
    qualificationQuality: { type: Number, required: true, min: 0, max: 100 },
    objectionHandling: { type: Number, required: true, min: 0, max: 100 },
    complianceScore: { type: Number, required: true, min: 0, max: 100 },
    closingQuality: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100, index: true },
    reasoning: { type: String, required: true },
  },
  { collection: "qualityscores", timestamps: true },
);

qualityScoreSchema.index({ organizationId: 1, conversationId: 1 }, { unique: true });
qualityScoreSchema.index({ organizationId: 1, overallScore: -1, updatedAt: -1 });

export type QualityScoreDocument = InferSchemaType<typeof qualityScoreSchema> & { _id: mongoose.Types.ObjectId };
export const QualityScoreModel =
  (mongoose.models.QualityScore ?? mongoose.model("QualityScore", qualityScoreSchema)) as mongoose.Model<any>;

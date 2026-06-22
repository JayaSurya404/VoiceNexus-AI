import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sentimentAnalysisSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"], required: true, index: true },
    score: { type: Number, required: true, min: -1, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    reasoning: { type: String, required: true },
  },
  { collection: "sentimentanalyses", timestamps: true },
);

sentimentAnalysisSchema.index({ organizationId: 1, conversationId: 1 }, { unique: true });
sentimentAnalysisSchema.index({ organizationId: 1, updatedAt: -1 });

export type SentimentAnalysisDocument = InferSchemaType<typeof sentimentAnalysisSchema> & { _id: mongoose.Types.ObjectId };
export const SentimentAnalysisModel =
  (mongoose.models.SentimentAnalysis ??
    mongoose.model("SentimentAnalysis", sentimentAnalysisSchema)) as mongoose.Model<any>;

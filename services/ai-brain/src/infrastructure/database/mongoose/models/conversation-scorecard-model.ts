import mongoose, { Schema, type InferSchemaType } from "mongoose";

const conversationScorecardSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    coachingSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    discoveryQuality: { type: Number, required: true, min: 0, max: 100 },
    qualificationQuality: { type: Number, required: true, min: 0, max: 100 },
    objectionHandlingQuality: { type: Number, required: true, min: 0, max: 100 },
    complianceScore: { type: Number, required: true, min: 0, max: 100 },
    closingEffectiveness: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100, index: true },
    reasoning: { type: String, required: true },
  },
  { collection: "conversationscorecards", timestamps: true },
);

conversationScorecardSchema.index({ organizationId: 1, updatedAt: -1 });
conversationScorecardSchema.index({ organizationId: 1, coachingSessionId: 1 }, { unique: true, sparse: true });

export type ConversationScorecardDocument = InferSchemaType<typeof conversationScorecardSchema> & { _id: mongoose.Types.ObjectId };
export const ConversationScorecardModel =
  (mongoose.models.ConversationScorecard ??
    mongoose.model("ConversationScorecard", conversationScorecardSchema)) as mongoose.Model<any>;

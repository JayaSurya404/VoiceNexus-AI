import mongoose, { Schema, type InferSchemaType } from "mongoose";

const conversationAnalyticsSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    aiConfidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"], required: true, index: true },
    sentimentScore: { type: Number, required: true, min: -1, max: 1, default: 0 },
    qualityScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    outcome: {
      type: String,
      enum: ["SALE", "BOOKED_MEETING", "FOLLOW_UP", "TRANSFERRED", "VOICEMAIL", "NO_INTEREST", "FAILED", null],
      default: null,
      index: true,
    },
    leadScore: { type: Number, required: true, min: 0, default: 0 },
    qualificationLevel: { type: String, enum: ["HOT", "WARM", "COLD", "UNKNOWN"], required: true, default: "UNKNOWN", index: true },
    workflowSuccessRate: { type: Number, required: true, min: 0, max: 1, default: 0 },
  },
  { collection: "conversationanalytics", timestamps: true },
);

conversationAnalyticsSchema.index({ organizationId: 1, conversationId: 1 }, { unique: true });
conversationAnalyticsSchema.index({ organizationId: 1, updatedAt: -1 });

export type ConversationAnalyticsDocument = InferSchemaType<typeof conversationAnalyticsSchema> & { _id: mongoose.Types.ObjectId };
export const ConversationAnalyticsModel =
  (mongoose.models.ConversationAnalytics ??
    mongoose.model("ConversationAnalytics", conversationAnalyticsSchema)) as mongoose.Model<any>;

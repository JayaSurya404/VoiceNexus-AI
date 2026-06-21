import mongoose, { Schema, type InferSchemaType } from "mongoose";

const aiConversationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "ENDED", "FAILED"], required: true, index: true },
    currentIntent: { type: String, required: true },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED", "UNKNOWN"], required: true },
    leadScore: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, default: null },
    outcome: { type: String, default: null },
    nextActions: { type: [String], default: [] },
    actionItems: { type: [String], default: [] },
    customerConcerns: { type: [String], default: [] },
    opportunities: { type: [String], default: [] },
    state: {
      detectedLanguage: { type: String, default: null },
      qualificationProgress: {
        budget: { type: Boolean, default: false },
        urgency: { type: Boolean, default: false },
        authority: { type: Boolean, default: false },
      },
      collectedFacts: { type: Map, of: String, default: {} },
      lastResponse: { type: String, default: null },
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
  },
  { collection: "aiconversations", timestamps: true },
);

aiConversationSchema.index({ organizationId: 1, callId: 1 }, { unique: true, sparse: true });
aiConversationSchema.index({ organizationId: 1, leadId: 1, updatedAt: -1 });

export type AIConversationDocument = InferSchemaType<typeof aiConversationSchema> & { _id: mongoose.Types.ObjectId };
export const AIConversationModel =
  (mongoose.models.AIConversation ?? mongoose.model("AIConversation", aiConversationSchema)) as mongoose.Model<any>;

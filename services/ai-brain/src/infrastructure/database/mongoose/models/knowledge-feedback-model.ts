import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeFeedbackSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    searchId: { type: Schema.Types.ObjectId, default: null, index: true },
    citationId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    chunkId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: {
      type: String,
      enum: ["HELPFUL", "UNHELPFUL", "ESCALATED_CALL", "HUMAN_TAKEOVER", "LOW_CONFIDENCE_RESPONSE", "FAILED_SEARCH"],
      required: true,
      index: true,
    },
    retrievalUsage: { type: String, enum: ["RETRIEVED", "USED", "IGNORED", "HELPFUL", "UNHELPFUL"], required: true, index: true },
    rating: { type: Number, default: null, min: 1, max: 5 },
    comment: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, default: null, index: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "knowledgefeedback" },
);

knowledgeFeedbackSchema.index({ organizationId: 1, createdAt: -1 });
knowledgeFeedbackSchema.index({ organizationId: 1, type: 1, createdAt: -1 });

export type KnowledgeFeedbackDocument = InferSchemaType<typeof knowledgeFeedbackSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeFeedbackModel =
  (mongoose.models.KnowledgeFeedback ??
    mongoose.model("KnowledgeFeedback", knowledgeFeedbackSchema)) as mongoose.Model<any>;

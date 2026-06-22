import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeLearningEventSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    sourceConversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    sourceSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    searchId: { type: Schema.Types.ObjectId, default: null, index: true },
    topic: { type: String, required: true, trim: true, index: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    triggerReason: {
      type: String,
      enum: ["LOW_RETRIEVAL_CONFIDENCE", "FAILED_SEARCH", "UNHELPFUL_FEEDBACK", "HELPFUL_FEEDBACK", "ESCALATION", "HUMAN_TAKEOVER"],
      required: true,
      index: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "knowledgelearningevents" },
);

knowledgeLearningEventSchema.index({ organizationId: 1, createdAt: -1 });
knowledgeLearningEventSchema.index({ organizationId: 1, topic: 1, createdAt: -1 });

export type KnowledgeLearningEventDocument = InferSchemaType<typeof knowledgeLearningEventSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeLearningEventModel =
  (mongoose.models.KnowledgeLearningEvent ??
    mongoose.model("KnowledgeLearningEvent", knowledgeLearningEventSchema)) as mongoose.Model<any>;

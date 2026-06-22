import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeGapSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    triggerCount: { type: Number, required: true, min: 0, default: 0 },
    unansweredCount: { type: Number, required: true, min: 0, default: 0 },
    escalationCount: { type: Number, required: true, min: 0, default: 0 },
    averageConfidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    severityScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    status: { type: String, enum: ["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"], required: true, default: "OPEN", index: true },
    sourceSearchIds: { type: [Schema.Types.ObjectId], default: [] },
    sourceConversationIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { collection: "knowledgegaps", timestamps: true },
);

knowledgeGapSchema.index({ organizationId: 1, topic: 1 }, { unique: true });
knowledgeGapSchema.index({ organizationId: 1, status: 1, severityScore: -1 });

export type KnowledgeGapDocument = InferSchemaType<typeof knowledgeGapSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeGapModel =
  (mongoose.models.KnowledgeGap ?? mongoose.model("KnowledgeGap", knowledgeGapSchema)) as mongoose.Model<any>;

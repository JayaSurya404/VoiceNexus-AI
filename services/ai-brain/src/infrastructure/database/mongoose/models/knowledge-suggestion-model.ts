import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeSuggestionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    gapId: { type: Schema.Types.ObjectId, default: null, index: true },
    type: { type: String, enum: ["FAQ_ENTRY", "SOP_UPDATE", "KNOWLEDGE_ARTICLE", "MISSING_DOCUMENTATION"], required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    rationale: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], required: true, default: "PENDING", index: true },
    reviewedBy: { type: Schema.Types.ObjectId, default: null, index: true },
    reviewedAt: { type: Date, default: null },
  },
  { collection: "knowledgesuggestions", timestamps: true },
);

knowledgeSuggestionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
knowledgeSuggestionSchema.index({ organizationId: 1, gapId: 1, type: 1 });

export type KnowledgeSuggestionDocument = InferSchemaType<typeof knowledgeSuggestionSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeSuggestionModel =
  (mongoose.models.KnowledgeSuggestion ??
    mongoose.model("KnowledgeSuggestion", knowledgeSuggestionSchema)) as mongoose.Model<any>;

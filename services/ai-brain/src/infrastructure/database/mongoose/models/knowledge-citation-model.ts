import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeCitationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    searchId: { type: Schema.Types.ObjectId, default: null, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    documentId: { type: Schema.Types.ObjectId, required: true, index: true },
    chunkId: { type: Schema.Types.ObjectId, required: true, index: true },
    quote: { type: String, required: true },
    relevanceScore: { type: Number, required: true, min: 0, max: 1 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "knowledgecitations" },
);

knowledgeCitationSchema.index({ organizationId: 1, createdAt: -1 });
knowledgeCitationSchema.index({ organizationId: 1, searchId: 1, relevanceScore: -1 });
knowledgeCitationSchema.index({ organizationId: 1, conversationId: 1, createdAt: -1 });

export type KnowledgeCitationDocument = InferSchemaType<typeof knowledgeCitationSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeCitationModel =
  (mongoose.models.KnowledgeCitation ??
    mongoose.model("KnowledgeCitation", knowledgeCitationSchema)) as mongoose.Model<any>;

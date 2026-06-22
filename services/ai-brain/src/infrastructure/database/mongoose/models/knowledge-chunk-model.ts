import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeChunkSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    knowledgeBaseId: { type: Schema.Types.ObjectId, required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, required: true, index: true },
    chunkIndex: { type: Number, required: true, min: 0 },
    content: { type: String, required: true },
    tokenCount: { type: Number, required: true, min: 0 },
    embedding: { type: [Number], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "knowledgechunks", timestamps: true },
);

knowledgeChunkSchema.index({ organizationId: 1, knowledgeBaseId: 1, updatedAt: -1 });
knowledgeChunkSchema.index({ organizationId: 1, documentId: 1, chunkIndex: 1 }, { unique: true });

export type KnowledgeChunkDocument = InferSchemaType<typeof knowledgeChunkSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeChunkModel =
  (mongoose.models.KnowledgeChunk ??
    mongoose.model("KnowledgeChunk", knowledgeChunkSchema)) as mongoose.Model<any>;

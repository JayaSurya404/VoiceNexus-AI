import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeDocumentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    knowledgeBaseId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    documentType: { type: String, enum: ["PDF", "DOCX", "TXT", "MARKDOWN"], required: true, index: true },
    status: { type: String, enum: ["UPLOADED", "PARSED", "CHUNKED", "EMBEDDED", "FAILED"], required: true, index: true },
    sourceName: { type: String, required: true, trim: true },
    contentHash: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    error: { type: String, default: null },
    chunkCount: { type: Number, required: true, min: 0, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, default: null, index: true },
  },
  { collection: "knowledgedocuments", timestamps: true },
);

knowledgeDocumentSchema.index({ organizationId: 1, knowledgeBaseId: 1, updatedAt: -1 });
knowledgeDocumentSchema.index({ organizationId: 1, contentHash: 1 });
knowledgeDocumentSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type KnowledgeDocumentDocument = InferSchemaType<typeof knowledgeDocumentSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeDocumentModel =
  (mongoose.models.KnowledgeDocument ??
    mongoose.model("KnowledgeDocument", knowledgeDocumentSchema)) as mongoose.Model<any>;

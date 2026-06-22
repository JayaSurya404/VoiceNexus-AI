import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeSearchSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    query: { type: String, required: true },
    transcript: { type: String, default: null },
    crmContext: { type: Schema.Types.Mixed, default: {} },
    memoryContext: { type: Schema.Types.Mixed, default: {} },
    resultChunkIds: { type: [Schema.Types.ObjectId], default: [] },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "knowledgesearches" },
);

knowledgeSearchSchema.index({ organizationId: 1, createdAt: -1 });
knowledgeSearchSchema.index({ organizationId: 1, confidence: -1, createdAt: -1 });

export type KnowledgeSearchDocument = InferSchemaType<typeof knowledgeSearchSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeSearchModel =
  (mongoose.models.KnowledgeSearch ??
    mongoose.model("KnowledgeSearch", knowledgeSearchSchema)) as mongoose.Model<any>;

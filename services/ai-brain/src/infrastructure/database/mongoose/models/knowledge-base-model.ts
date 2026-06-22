import mongoose, { Schema, type InferSchemaType } from "mongoose";

const knowledgeBaseSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    active: { type: Boolean, required: true, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, default: null, index: true },
  },
  { collection: "knowledgebases", timestamps: true },
);

knowledgeBaseSchema.index({ organizationId: 1, name: 1 }, { unique: true });
knowledgeBaseSchema.index({ organizationId: 1, active: 1, updatedAt: -1 });

export type KnowledgeBaseDocument = InferSchemaType<typeof knowledgeBaseSchema> & { _id: mongoose.Types.ObjectId };
export const KnowledgeBaseModel =
  (mongoose.models.KnowledgeBase ??
    mongoose.model("KnowledgeBase", knowledgeBaseSchema)) as mongoose.Model<any>;

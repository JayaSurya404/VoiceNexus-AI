import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface MemoryTagDocument {
  organizationId: Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const memoryTagSchema = new mongoose.Schema<MemoryTagDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { timestamps: true },
);

memoryTagSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export type MemoryTagMongoDocument = HydratedDocument<MemoryTagDocument>;

export const MemoryTagModel =
  (mongoose.models.MemoryTag as Model<MemoryTagDocument> | undefined) ??
  mongoose.model<MemoryTagDocument>("MemoryTag", memoryTagSchema);

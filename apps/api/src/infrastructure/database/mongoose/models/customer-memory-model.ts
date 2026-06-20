import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface CustomerMemoryDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  summary: string;
  relationshipScore: number;
  lastInteractionAt: Date | null;
  memoryTags: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const customerMemorySchema = new mongoose.Schema<CustomerMemoryDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 5000 },
    relationshipScore: { type: Number, default: 50, min: 0, max: 100 },
    lastInteractionAt: { type: Date, default: null },
    memoryTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemoryTag" }],
  },
  { timestamps: true },
);

customerMemorySchema.index({ organizationId: 1, leadId: 1 }, { unique: true });
customerMemorySchema.index({ organizationId: 1, relationshipScore: -1 });

export type CustomerMemoryMongoDocument = HydratedDocument<CustomerMemoryDocument>;

export const CustomerMemoryModel =
  (mongoose.models.CustomerMemory as Model<CustomerMemoryDocument> | undefined) ??
  mongoose.model<CustomerMemoryDocument>("CustomerMemory", customerMemorySchema);

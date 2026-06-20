import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface TagDocument {
  organizationId: Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new mongoose.Schema<TagDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 48 },
    color: { type: String, required: true, trim: true, default: "#0ea5e9" },
  },
  { timestamps: true },
);

tagSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export type TagMongoDocument = HydratedDocument<TagDocument>;

export const TagModel =
  (mongoose.models.Tag as Model<TagDocument> | undefined) ??
  mongoose.model<TagDocument>("Tag", tagSchema);

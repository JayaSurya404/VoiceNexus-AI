import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export interface NoteDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const noteSchema = new mongoose.Schema<NoteDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

noteSchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });

export type NoteMongoDocument = HydratedDocument<NoteDocument>;

export const NoteModel =
  (mongoose.models.Note as Model<NoteDocument> | undefined) ??
  mongoose.model<NoteDocument>("Note", noteSchema);

import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { LeadStatus } from "@voicenexus/contracts";

export interface LeadDocument {
  organizationId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string;
  source: string;
  status: LeadStatus;
  score: number;
  language: string;
  assignedTo: Types.ObjectId | null;
  tags: Types.ObjectId[];
  notesCount: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new mongoose.Schema<LeadDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, default: null, maxlength: 254 },
    phone: { type: String, trim: true, default: null, maxlength: 32 },
    company: { type: String, trim: true, default: "", maxlength: 120 },
    source: { type: String, trim: true, default: "Manual", maxlength: 80 },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "INTERESTED", "FOLLOW_UP", "WON", "LOST"],
      default: "NEW",
      index: true,
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    language: { type: String, trim: true, default: "en", maxlength: 24 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    notesCount: { type: Number, default: 0, min: 0 },
    lastActivityAt: { type: Date, default: null },
  },
  { timestamps: true },
);

leadSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
leadSchema.index({ organizationId: 1, assignedTo: 1 });
leadSchema.index({ organizationId: 1, tags: 1 });
leadSchema.index({ organizationId: 1, firstName: "text", lastName: "text", email: "text", company: "text" });

export type LeadMongoDocument = HydratedDocument<LeadDocument>;

export const LeadModel =
  (mongoose.models.Lead as Model<LeadDocument> | undefined) ??
  mongoose.model<LeadDocument>("Lead", leadSchema);

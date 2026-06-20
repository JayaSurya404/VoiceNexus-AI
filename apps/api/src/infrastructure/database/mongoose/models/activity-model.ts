import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { ActivityType } from "@voicenexus/contracts";

export interface ActivityDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const activitySchema = new mongoose.Schema<ActivityDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: {
      type: String,
      enum: ["CALL", "WHATSAPP", "EMAIL", "NOTE", "TASK", "MEETING"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, default: "", maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });

export type ActivityMongoDocument = HydratedDocument<ActivityDocument>;

export const ActivityModel =
  (mongoose.models.Activity as Model<ActivityDocument> | undefined) ??
  mongoose.model<ActivityDocument>("Activity", activitySchema);

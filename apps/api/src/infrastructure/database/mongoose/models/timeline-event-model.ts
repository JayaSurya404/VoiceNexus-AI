import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { TimelineEventType } from "@voicenexus/contracts";

export interface TimelineEventDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId;
  eventType: TimelineEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const timelineEventSchema = new mongoose.Schema<TimelineEventDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    eventType: {
      type: String,
      enum: [
        "CALL_COMPLETED",
        "LEAD_CREATED",
        "FOLLOW_UP_CREATED",
        "PAYMENT_SENT",
        "PAYMENT_RECEIVED",
        "APPOINTMENT_BOOKED",
        "APPOINTMENT_COMPLETED",
        "WHATSAPP_SENT",
        "NOTE_CREATED",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

timelineEventSchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });

export type TimelineEventMongoDocument = HydratedDocument<TimelineEventDocument>;

export const TimelineEventModel =
  (mongoose.models.TimelineEvent as Model<TimelineEventDocument> | undefined) ??
  mongoose.model<TimelineEventDocument>("TimelineEvent", timelineEventSchema);

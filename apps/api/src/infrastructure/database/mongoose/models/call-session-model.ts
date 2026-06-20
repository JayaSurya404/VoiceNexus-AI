import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { CallDirection, CallStatus, TelephonyProvider } from "@voicenexus/contracts";

export interface CallSessionDocument {
  organizationId: Types.ObjectId;
  leadId: Types.ObjectId | null;
  phoneNumberId: Types.ObjectId | null;
  provider: TelephonyProvider;
  providerCallSid: string | null;
  direction: CallDirection;
  status: CallStatus;
  from: string;
  to: string;
  initiatedBy: Types.ObjectId | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  recordingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const callSessionSchema = new mongoose.Schema<CallSessionDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    phoneNumberId: { type: mongoose.Schema.Types.ObjectId, ref: "PhoneNumber", default: null },
    provider: { type: String, enum: ["TWILIO", "EXOTEL"], required: true, default: "TWILIO" },
    providerCallSid: { type: String, trim: true, default: null, index: true, maxlength: 80 },
    direction: { type: String, enum: ["INBOUND", "OUTBOUND"], required: true, index: true },
    status: {
      type: String,
      enum: ["QUEUED", "RINGING", "IN_PROGRESS", "COMPLETED", "FAILED", "BUSY", "NO_ANSWER", "CANCELED"],
      required: true,
      index: true,
    },
    from: { type: String, required: true, trim: true, maxlength: 32 },
    to: { type: String, required: true, trim: true, maxlength: 32 },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null, min: 0 },
    recordingEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

callSessionSchema.index({ organizationId: 1, createdAt: -1 });
callSessionSchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });

export type CallSessionMongoDocument = HydratedDocument<CallSessionDocument>;

export const CallSessionModel =
  (mongoose.models.CallSession as Model<CallSessionDocument> | undefined) ??
  mongoose.model<CallSessionDocument>("CallSession", callSessionSchema);

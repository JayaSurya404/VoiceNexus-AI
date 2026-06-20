import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { CallEventType } from "@voicenexus/contracts";

export interface CallEventDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  type: CallEventType;
  title: string;
  description: string;
  providerStatus: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const callEventSchema = new mongoose.Schema<CallEventDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CallSession", required: true, index: true },
    type: {
      type: String,
      enum: [
        "CALL_CREATED",
        "CALL_QUEUED",
        "CALL_RINGING",
        "CALL_ANSWERED",
        "CALL_COMPLETED",
        "CALL_FAILED",
        "CALL_TRANSFERRED",
        "RECORDING_AVAILABLE",
        "WEBHOOK_RECEIVED",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
    providerStatus: { type: String, trim: true, default: null, maxlength: 80 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

callEventSchema.index({ organizationId: 1, callSessionId: 1, createdAt: 1 });

export type CallEventMongoDocument = HydratedDocument<CallEventDocument>;

export const CallEventModel =
  (mongoose.models.CallEvent as Model<CallEventDocument> | undefined) ??
  mongoose.model<CallEventDocument>("CallEvent", callEventSchema);

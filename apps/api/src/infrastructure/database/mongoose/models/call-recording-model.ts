import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { CallRecordingStatus } from "@voicenexus/contracts";

export interface CallRecordingDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  providerRecordingSid: string;
  recordingUrl: string;
  status: CallRecordingStatus;
  durationSeconds: number | null;
  createdAt: Date;
}

const callRecordingSchema = new mongoose.Schema<CallRecordingDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CallSession", required: true, index: true },
    providerRecordingSid: { type: String, required: true, trim: true, maxlength: 80, index: true },
    recordingUrl: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["PROCESSING", "COMPLETED", "FAILED"], required: true, default: "PROCESSING" },
    durationSeconds: { type: Number, default: null, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

callRecordingSchema.index({ organizationId: 1, callSessionId: 1, createdAt: -1 });
callRecordingSchema.index({ providerRecordingSid: 1 }, { unique: true });

export type CallRecordingMongoDocument = HydratedDocument<CallRecordingDocument>;

export const CallRecordingModel =
  (mongoose.models.CallRecording as Model<CallRecordingDocument> | undefined) ??
  mongoose.model<CallRecordingDocument>("CallRecording", callRecordingSchema);

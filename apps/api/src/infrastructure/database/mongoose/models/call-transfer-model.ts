import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { CallTransferStatus } from "@voicenexus/contracts";

export interface CallTransferDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toPhoneNumber: string;
  status: CallTransferStatus;
  reason: string;
  createdAt: Date;
}

const callTransferSchema = new mongoose.Schema<CallTransferDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CallSession", required: true, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toPhoneNumber: { type: String, required: true, trim: true, maxlength: 32 },
    status: { type: String, enum: ["REQUESTED", "COMPLETED", "FAILED"], required: true, default: "REQUESTED" },
    reason: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

callTransferSchema.index({ organizationId: 1, callSessionId: 1, createdAt: -1 });

export type CallTransferMongoDocument = HydratedDocument<CallTransferDocument>;

export const CallTransferModel =
  (mongoose.models.CallTransfer as Model<CallTransferDocument> | undefined) ??
  mongoose.model<CallTransferDocument>("CallTransfer", callTransferSchema);

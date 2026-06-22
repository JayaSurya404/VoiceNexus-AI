import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { RealtimeConversationStatus } from "../../../../domain/entities/realtime-conversation.js";
import type { SpeechStateName } from "../../../../domain/entities/speech-state.js";

export interface RealtimeConversationDocument {
  organizationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  aiSessionId: Types.ObjectId | null;
  status: RealtimeConversationStatus;
  speechState: SpeechStateName;
  currentTurnId: Types.ObjectId | null;
  activePlaybackSessionId: Types.ObjectId | null;
  takeoverActive: boolean;
  takeoverBy: Types.ObjectId | null;
  startedAt: Date;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const realtimeConversationSchema = new mongoose.Schema<RealtimeConversationDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    aiSessionId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["ACTIVE", "TAKEOVER", "COMPLETED", "FAILED"], required: true, index: true },
    speechState: {
      type: String,
      enum: ["LISTENING", "PROCESSING", "RESPONDING", "INTERRUPTED", "TRANSFERRED", "COMPLETED"],
      required: true,
      index: true,
    },
    currentTurnId: { type: mongoose.Schema.Types.ObjectId, default: null },
    activePlaybackSessionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    takeoverActive: { type: Boolean, default: false, index: true },
    takeoverBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { collection: "realtimeconversations", timestamps: true },
);

realtimeConversationSchema.index({ organizationId: 1, callSessionId: 1 }, { unique: true });
realtimeConversationSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type RealtimeConversationMongoDocument = HydratedDocument<RealtimeConversationDocument>;
export const RealtimeConversationModel =
  (mongoose.models.RealtimeConversation as Model<RealtimeConversationDocument> | undefined) ??
  mongoose.model<RealtimeConversationDocument>("RealtimeConversation", realtimeConversationSchema);

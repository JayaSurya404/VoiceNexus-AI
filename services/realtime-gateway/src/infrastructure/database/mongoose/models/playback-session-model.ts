import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { PlaybackSessionStatus } from "../../../../domain/entities/playback-session.js";

export interface PlaybackSessionDocument {
  organizationId: Types.ObjectId;
  realtimeConversationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  voiceResponseId: Types.ObjectId;
  status: PlaybackSessionStatus;
  progressMs: number;
  durationMs: number;
  queuedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const playbackSessionSchema = new mongoose.Schema<PlaybackSessionDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    realtimeConversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    voiceResponseId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["QUEUED", "PLAYING", "PAUSED", "COMPLETED", "CANCELLED", "FAILED"], required: true, index: true },
    progressMs: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    queuedAt: { type: Date, required: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { collection: "playbacksessions", timestamps: true },
);

playbackSessionSchema.index({ organizationId: 1, realtimeConversationId: 1, createdAt: -1 });
playbackSessionSchema.index({ organizationId: 1, callSessionId: 1, status: 1 });

export type PlaybackSessionMongoDocument = HydratedDocument<PlaybackSessionDocument>;
export const PlaybackSessionModel =
  (mongoose.models.PlaybackSession as Model<PlaybackSessionDocument> | undefined) ??
  mongoose.model<PlaybackSessionDocument>("PlaybackSession", playbackSessionSchema);

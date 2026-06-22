export type PlaybackSessionStatus = "QUEUED" | "PLAYING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface PlaybackSession {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  voiceResponseId: string;
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

export interface NewPlaybackSession {
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  voiceResponseId: string;
  status: PlaybackSessionStatus;
  progressMs: number;
  durationMs: number;
  queuedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  metadata: Record<string, unknown>;
}

export type PlaybackSessionUpdate = Partial<
  Pick<PlaybackSession, "status" | "progressMs" | "startedAt" | "completedAt" | "cancelledAt" | "metadata">
>;

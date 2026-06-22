export interface BargeInEvent {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  playbackSessionId: string | null;
  voiceResponseId: string | null;
  transcriptFragment: string | null;
  reason: string;
  detectedAt: Date;
  createdAt: Date;
}

export type NewBargeInEvent = Omit<BargeInEvent, "id" | "createdAt">;

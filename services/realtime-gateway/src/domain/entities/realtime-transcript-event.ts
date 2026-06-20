export const realtimeTranscriptEventTypes = ["PARTIAL", "FINAL"] as const;

export type RealtimeTranscriptEventType = (typeof realtimeTranscriptEventTypes)[number];

export interface RealtimeTranscriptEvent {
  id: string;
  organizationId: string;
  callSessionId: string;
  aiConversationSessionId: string | null;
  type: RealtimeTranscriptEventType;
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  language: string | null;
  confidence: number | null;
  sequenceNumber: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface NewRealtimeTranscriptEvent {
  organizationId: string;
  callSessionId: string;
  aiConversationSessionId: string | null;
  type: RealtimeTranscriptEventType;
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  language: string | null;
  confidence: number | null;
  sequenceNumber: number;
  metadata: Record<string, unknown>;
}

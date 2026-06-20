import type { AiConversationStatus } from "./entities/ai-conversation-session.js";

export interface ActiveCallSession {
  organizationId: string;
  callSessionId: string;
  providerCallSid: string | null;
  streamSid: string | null;
  status: AiConversationStatus;
  connectedAt: string;
  updatedAt: string;
  from: string | null;
  to: string | null;
}

export interface RealtimeConnectionState {
  connectionId: string;
  organizationId: string;
  callSessionId: string;
  streamSid: string | null;
  lastEvent: string;
  lastSequenceNumber: number | null;
  connectedAt: string;
  updatedAt: string;
}

export interface BufferedTranscriptEvent {
  organizationId: string;
  callSessionId: string;
  type: "PARTIAL" | "FINAL";
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  sequenceNumber: number;
  createdAt: string;
}

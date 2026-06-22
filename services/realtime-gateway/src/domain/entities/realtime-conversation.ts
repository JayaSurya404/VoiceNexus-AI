import type { SpeechStateName } from "./speech-state.js";

export type RealtimeConversationStatus = "ACTIVE" | "TAKEOVER" | "COMPLETED" | "FAILED";

export interface RealtimeConversation {
  id: string;
  organizationId: string;
  callSessionId: string;
  aiSessionId: string | null;
  status: RealtimeConversationStatus;
  speechState: SpeechStateName;
  currentTurnId: string | null;
  activePlaybackSessionId: string | null;
  takeoverActive: boolean;
  takeoverBy: string | null;
  startedAt: Date;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewRealtimeConversation {
  organizationId: string;
  callSessionId: string;
  aiSessionId: string | null;
  status: RealtimeConversationStatus;
  speechState: SpeechStateName;
  currentTurnId: string | null;
  activePlaybackSessionId: string | null;
  takeoverActive: boolean;
  takeoverBy: string | null;
  startedAt: Date;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
}

export type RealtimeConversationUpdate = Partial<
  Pick<
    RealtimeConversation,
    | "aiSessionId"
    | "status"
    | "speechState"
    | "currentTurnId"
    | "activePlaybackSessionId"
    | "takeoverActive"
    | "takeoverBy"
    | "endedAt"
    | "metadata"
  >
>;

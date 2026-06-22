export const speechStates = ["LISTENING", "PROCESSING", "RESPONDING", "INTERRUPTED", "TRANSFERRED", "COMPLETED"] as const;

export type SpeechStateName = (typeof speechStates)[number];

export interface SpeechState {
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  state: SpeechStateName;
  previousState: SpeechStateName | null;
  reason: string;
  changedAt: Date;
}

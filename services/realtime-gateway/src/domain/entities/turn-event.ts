export type TurnEventType =
  | "CUSTOMER_TURN_STARTED"
  | "CUSTOMER_TURN_ENDED"
  | "AI_TURN_STARTED"
  | "AI_TURN_ENDED";

export interface TurnEvent {
  id: string;
  organizationId: string;
  realtimeConversationId: string;
  callSessionId: string;
  type: TurnEventType;
  speaker: "CUSTOMER" | "AI";
  transcript: string | null;
  latencyMs: number | null;
  metadata: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
}

export type NewTurnEvent = Omit<TurnEvent, "id" | "createdAt">;

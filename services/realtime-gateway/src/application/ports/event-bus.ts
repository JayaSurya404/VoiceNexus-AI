export const realtimeTopics = [
  "call.lifecycle",
  "call.audio",
  "transcript.partial",
  "transcript.final",
  "voice.response.requested",
  "voice.response.created",
  "voice.response.playback",
] as const;

export type RealtimeTopic = (typeof realtimeTopics)[number];

export interface RealtimeEventEnvelope<TPayload = Record<string, unknown>> {
  id: string;
  topic: RealtimeTopic;
  organizationId: string;
  callSessionId: string | null;
  occurredAt: string;
  payload: TPayload;
}

export type RealtimeEventHandler = (event: RealtimeEventEnvelope) => void | Promise<void>;

export interface EventBus {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<TPayload extends Record<string, unknown>>(
    topic: RealtimeTopic,
    event: Omit<RealtimeEventEnvelope<TPayload>, "id" | "topic" | "occurredAt">,
  ): Promise<void>;
  subscribe(topic: RealtimeTopic, handler: RealtimeEventHandler): Promise<void>;
}

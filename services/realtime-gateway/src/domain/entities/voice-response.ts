export type VoiceResponseStatus = "PENDING" | "GENERATING" | "QUEUED" | "PLAYING" | "COMPLETED" | "FAILED";

export interface VoiceResponse {
  id: string;
  organizationId: string;
  sessionId: string | null;
  callId: string;
  leadId: string | null;
  responseText: string;
  provider: string;
  voice: string;
  audioUrl: string | null;
  durationMs: number;
  audioBytes: number;
  status: VoiceResponseStatus;
  latencyMs: number | null;
  playbackStartedAt: Date | null;
  playbackCompletedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewVoiceResponse {
  organizationId: string;
  sessionId: string | null;
  callId: string;
  leadId: string | null;
  responseText: string;
  provider: string;
  voice: string;
  audioUrl: string | null;
  durationMs: number;
  audioBytes: number;
  status: VoiceResponseStatus;
  latencyMs: number | null;
  playbackStartedAt: Date | null;
  playbackCompletedAt: Date | null;
  error: string | null;
}

export type VoiceResponseUpdate = Partial<
  Pick<
    VoiceResponse,
    | "provider"
    | "voice"
    | "audioUrl"
    | "durationMs"
    | "audioBytes"
    | "status"
    | "latencyMs"
    | "playbackStartedAt"
    | "playbackCompletedAt"
    | "error"
  >
>;

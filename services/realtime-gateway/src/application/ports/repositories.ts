import type {
  AiConversationSession,
  AiConversationSessionUpdate,
  NewAiConversationSession,
} from "../../domain/entities/ai-conversation-session.js";
import type {
  NewRealtimeTranscriptEvent,
  RealtimeTranscriptEvent,
} from "../../domain/entities/realtime-transcript-event.js";
import type {
  NewVoiceResponse,
  VoiceResponse,
  VoiceResponseUpdate,
} from "../../domain/entities/voice-response.js";

export interface AiConversationSessionRepository {
  create(input: NewAiConversationSession): Promise<AiConversationSession>;
  findByCallSession(organizationId: string, callSessionId: string): Promise<AiConversationSession | null>;
  updateByCallSession(
    organizationId: string,
    callSessionId: string,
    input: AiConversationSessionUpdate,
  ): Promise<AiConversationSession | null>;
}

export interface RealtimeTranscriptEventRepository {
  create(input: NewRealtimeTranscriptEvent): Promise<RealtimeTranscriptEvent>;
  listByCallSession(organizationId: string, callSessionId: string): Promise<RealtimeTranscriptEvent[]>;
}

export interface OrganizationMemberAccessRepository {
  hasActiveMembership(userId: string, organizationId: string): Promise<boolean>;
}

export interface VoiceResponseMetrics {
  responsesGenerated: number;
  audioSecondsGenerated: number;
  averageLatency: number;
  providerUsage: Record<string, number>;
  playbackSuccessRate: number;
}

export interface VoiceResponseRepository {
  create(input: NewVoiceResponse): Promise<VoiceResponse>;
  findById(id: string): Promise<VoiceResponse | null>;
  listByOrganization(organizationId: string): Promise<VoiceResponse[]>;
  listBySession(organizationId: string, sessionId: string): Promise<VoiceResponse[]>;
  metrics(organizationId: string): Promise<VoiceResponseMetrics>;
  update(id: string, input: VoiceResponseUpdate): Promise<VoiceResponse | null>;
}

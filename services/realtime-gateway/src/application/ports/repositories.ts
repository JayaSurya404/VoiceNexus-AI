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
import type {
  NewRealtimeConversation,
  RealtimeConversation,
  RealtimeConversationUpdate,
} from "../../domain/entities/realtime-conversation.js";
import type { NewTurnEvent, TurnEvent } from "../../domain/entities/turn-event.js";
import type { BargeInEvent, NewBargeInEvent } from "../../domain/entities/barge-in-event.js";
import type { NewPlaybackSession, PlaybackSession, PlaybackSessionUpdate } from "../../domain/entities/playback-session.js";

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

export interface RealtimeConversationRepository {
  create(input: NewRealtimeConversation): Promise<RealtimeConversation>;
  findByCallSession(organizationId: string, callSessionId: string): Promise<RealtimeConversation | null>;
  findById(id: string): Promise<RealtimeConversation | null>;
  listByOrganization(organizationId: string): Promise<RealtimeConversation[]>;
  update(id: string, input: RealtimeConversationUpdate): Promise<RealtimeConversation | null>;
}

export interface TurnEventRepository {
  create(input: NewTurnEvent): Promise<TurnEvent>;
  listByConversation(realtimeConversationId: string): Promise<TurnEvent[]>;
  listByOrganization(organizationId: string, limit?: number): Promise<TurnEvent[]>;
}

export interface BargeInEventRepository {
  create(input: NewBargeInEvent): Promise<BargeInEvent>;
  listByConversation(realtimeConversationId: string): Promise<BargeInEvent[]>;
  listByOrganization(organizationId: string, limit?: number): Promise<BargeInEvent[]>;
}

export interface PlaybackSessionRepository {
  create(input: NewPlaybackSession): Promise<PlaybackSession>;
  findActiveByCall(organizationId: string, callSessionId: string): Promise<PlaybackSession | null>;
  findById(id: string): Promise<PlaybackSession | null>;
  listByConversation(realtimeConversationId: string): Promise<PlaybackSession[]>;
  listByOrganization(organizationId: string, limit?: number): Promise<PlaybackSession[]>;
  update(id: string, input: PlaybackSessionUpdate): Promise<PlaybackSession | null>;
}

export interface RealtimeRuntimeMetrics {
  sttLatency: number;
  aiLatency: number;
  ttsLatency: number;
  playbackLatency: number;
  totalLatency: number;
  activeConversations: number;
  bargeIns: number;
  takeoverActive: number;
}

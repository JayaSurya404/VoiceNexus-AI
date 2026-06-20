import type {
  AiConversationSession,
  AiConversationSessionUpdate,
  NewAiConversationSession,
} from "../../domain/entities/ai-conversation-session.js";
import type {
  NewRealtimeTranscriptEvent,
  RealtimeTranscriptEvent,
} from "../../domain/entities/realtime-transcript-event.js";

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

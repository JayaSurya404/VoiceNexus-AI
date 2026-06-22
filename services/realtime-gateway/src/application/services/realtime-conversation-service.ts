import type { EventBus } from "../ports/event-bus.js";
import type { RealtimeConversationRepository } from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";

export class RealtimeConversationService {
  constructor(
    private readonly conversations: RealtimeConversationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async ensure(input: {
    organizationId: string;
    callSessionId: string;
    aiSessionId?: string | null;
  }): Promise<RealtimeConversation> {
    const existing = await this.conversations.findByCallSession(input.organizationId, input.callSessionId);

    if (existing) {
      return existing;
    }

    const conversation = await this.conversations.create({
      organizationId: input.organizationId,
      callSessionId: input.callSessionId,
      aiSessionId: input.aiSessionId ?? null,
      status: "ACTIVE",
      speechState: "LISTENING",
      currentTurnId: null,
      activePlaybackSessionId: null,
      takeoverActive: false,
      takeoverBy: null,
      startedAt: new Date(),
      endedAt: null,
      metadata: {},
    });
    await this.eventBus.publish("speech.state.changed", {
      organizationId: input.organizationId,
      callSessionId: input.callSessionId,
      payload: { type: "SPEECH_STATE_CHANGED", state: "LISTENING", realtimeConversationId: conversation.id },
    });
    return conversation;
  }

  list(organizationId: string) {
    return this.conversations.listByOrganization(organizationId);
  }

  findById(id: string) {
    return this.conversations.findById(id);
  }
}

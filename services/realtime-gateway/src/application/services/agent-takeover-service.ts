import type { EventBus } from "../ports/event-bus.js";
import type { RealtimeConversationRepository } from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";
import type { AudioInterruptService } from "./audio-interrupt-service.js";

export class AgentTakeoverService {
  constructor(
    private readonly conversations: RealtimeConversationRepository,
    private readonly audioInterrupt: AudioInterruptService,
    private readonly eventBus: EventBus,
  ) {}

  async requestTakeover(conversation: RealtimeConversation, userId: string | null): Promise<RealtimeConversation> {
    this.audioInterrupt.interrupt(conversation.callSessionId);
    const updated =
      (await this.conversations.update(conversation.id, {
        status: "TAKEOVER",
        speechState: "TRANSFERRED",
        takeoverActive: true,
        takeoverBy: userId,
        activePlaybackSessionId: null,
        metadata: { ...conversation.metadata, takeoverRequestedAt: new Date().toISOString() },
      })) ?? conversation;
    await this.eventBus.publish("agent.takeover", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "AGENT_TAKEOVER_REQUESTED", realtimeConversationId: conversation.id, userId },
    });
    return updated;
  }

  async releaseTakeover(conversation: RealtimeConversation): Promise<RealtimeConversation> {
    const updated =
      (await this.conversations.update(conversation.id, {
        status: "ACTIVE",
        speechState: "LISTENING",
        takeoverActive: false,
        takeoverBy: null,
        metadata: { ...conversation.metadata, takeoverReleasedAt: new Date().toISOString() },
      })) ?? conversation;
    await this.eventBus.publish("agent.takeover", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "AGENT_TAKEOVER_RELEASED", realtimeConversationId: conversation.id },
    });
    return updated;
  }

  async isTakeoverActive(organizationId: string, callSessionId: string): Promise<boolean> {
    const conversation = await this.conversations.findByCallSession(organizationId, callSessionId);
    return Boolean(conversation?.takeoverActive);
  }
}

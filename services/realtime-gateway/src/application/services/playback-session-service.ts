import type { EventBus } from "../ports/event-bus.js";
import type { PlaybackSessionRepository, RealtimeConversationRepository } from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";

export class PlaybackSessionService {
  constructor(
    private readonly playbacks: PlaybackSessionRepository,
    private readonly conversations: RealtimeConversationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async start(conversation: RealtimeConversation, voiceResponseId: string, durationMs: number) {
    const playback = await this.playbacks.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      voiceResponseId,
      status: "PLAYING",
      progressMs: 0,
      durationMs,
      queuedAt: new Date(),
      startedAt: new Date(),
      completedAt: null,
      cancelledAt: null,
      metadata: {},
    });
    await this.conversations.update(conversation.id, { activePlaybackSessionId: playback.id, speechState: "RESPONDING" });
    await this.eventBus.publish("playback.started", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "PLAYBACK_STARTED", playbackSessionId: playback.id, voiceResponseId },
    });
    return playback;
  }

  async complete(conversation: RealtimeConversation, voiceResponseId: string) {
    const active = await this.playbacks.findActiveByCall(conversation.organizationId, conversation.callSessionId);
    if (active) {
      await this.playbacks.update(active.id, {
        status: "COMPLETED",
        progressMs: active.durationMs,
        completedAt: new Date(),
      });
    }
    await this.conversations.update(conversation.id, { activePlaybackSessionId: null, speechState: "LISTENING" });
    await this.eventBus.publish("playback.completed", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "PLAYBACK_COMPLETED", playbackSessionId: active?.id ?? null, voiceResponseId },
    });
  }

  async cancel(conversation: RealtimeConversation, reason: string) {
    const active = await this.playbacks.findActiveByCall(conversation.organizationId, conversation.callSessionId);
    if (active) {
      await this.playbacks.update(active.id, {
        status: "CANCELLED",
        cancelledAt: new Date(),
        metadata: { ...active.metadata, cancellationReason: reason },
      });
    }
    await this.conversations.update(conversation.id, { activePlaybackSessionId: null, speechState: "INTERRUPTED" });
    await this.eventBus.publish("playback.cancelled", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "PLAYBACK_CANCELLED", playbackSessionId: active?.id ?? null, reason },
    });
    return active;
  }

  list(realtimeConversationId: string) {
    return this.playbacks.listByConversation(realtimeConversationId);
  }
}

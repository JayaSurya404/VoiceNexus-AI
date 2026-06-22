import type { EventBus } from "../ports/event-bus.js";
import type {
  BargeInEventRepository,
  PlaybackSessionRepository,
  RealtimeConversationRepository,
} from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";
import type { AudioInterruptService } from "./audio-interrupt-service.js";
import type { PlaybackSessionService } from "./playback-session-service.js";
import type { SpeechStateService } from "./speech-state-service.js";

export class BargeInService {
  constructor(
    private readonly bargeIns: BargeInEventRepository,
    private readonly playbacks: PlaybackSessionRepository,
    private readonly conversations: RealtimeConversationRepository,
    private readonly playbackSessions: PlaybackSessionService,
    private readonly audioInterrupt: AudioInterruptService,
    private readonly speechState: SpeechStateService,
    private readonly eventBus: EventBus,
  ) {}

  async detect(conversation: RealtimeConversation, transcriptFragment: string | null): Promise<boolean> {
    const activePlayback = await this.playbacks.findActiveByCall(conversation.organizationId, conversation.callSessionId);
    const aiIsResponding = conversation.speechState === "RESPONDING" || Boolean(activePlayback);

    if (!aiIsResponding) {
      return false;
    }

    const interrupt = this.audioInterrupt.interrupt(conversation.callSessionId);
    await this.playbackSessions.cancel(conversation, "Customer speech detected during AI playback");
    const event = await this.bargeIns.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      playbackSessionId: activePlayback?.id ?? conversation.activePlaybackSessionId,
      voiceResponseId: activePlayback?.voiceResponseId ?? null,
      transcriptFragment,
      reason: "CUSTOMER_INTERRUPTED_AI",
      detectedAt: new Date(),
    });
    await this.conversations.update(conversation.id, {
      speechState: "LISTENING",
      activePlaybackSessionId: null,
      metadata: {
        ...conversation.metadata,
        lastBargeInAt: event.detectedAt.toISOString(),
        lastInterrupt: interrupt,
      },
    });
    await this.speechState.change({ ...conversation, speechState: "INTERRUPTED" }, "LISTENING", "Barge-in completed");
    await this.eventBus.publish("bargein.detected", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: {
        type: "BARGE_IN_DETECTED",
        bargeInEventId: event.id,
        playbackSessionId: event.playbackSessionId,
        voiceResponseId: event.voiceResponseId,
        transcriptFragment,
        interrupt,
      },
    });
    return true;
  }

  list(realtimeConversationId: string) {
    return this.bargeIns.listByConversation(realtimeConversationId);
  }
}

import type { EventBus } from "../ports/event-bus.js";
import type { RealtimeConversationRepository } from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";
import type { SpeechStateName } from "../../domain/entities/speech-state.js";

export class SpeechStateService {
  constructor(
    private readonly conversations: RealtimeConversationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async change(conversation: RealtimeConversation, state: SpeechStateName, reason: string): Promise<RealtimeConversation> {
    const updated = await this.conversations.update(conversation.id, { speechState: state });
    const next = updated ?? conversation;
    await this.eventBus.publish("speech.state.changed", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: {
        type: "SPEECH_STATE_CHANGED",
        realtimeConversationId: conversation.id,
        previousState: conversation.speechState,
        state,
        reason,
      },
    });
    return next;
  }
}

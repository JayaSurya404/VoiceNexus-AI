import type { EventBus } from "../ports/event-bus.js";
import type { RealtimeConversationRepository, TurnEventRepository } from "../ports/repositories.js";
import type { RealtimeConversation } from "../../domain/entities/realtime-conversation.js";

export class TurnManagerService {
  constructor(
    private readonly turns: TurnEventRepository,
    private readonly conversations: RealtimeConversationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async customerStarted(conversation: RealtimeConversation, transcriptFragment: string | null): Promise<void> {
    if (conversation.currentTurnId) return;
    const turn = await this.turns.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      type: "CUSTOMER_TURN_STARTED",
      speaker: "CUSTOMER",
      transcript: transcriptFragment,
      latencyMs: null,
      metadata: {},
      occurredAt: new Date(),
    });
    await this.conversations.update(conversation.id, { currentTurnId: turn.id });
    await this.eventBus.publish("turn.started", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "CUSTOMER_TURN_STARTED", turnId: turn.id },
    });
  }

  async customerEnded(conversation: RealtimeConversation, transcript: string, latencyMs: number | null): Promise<void> {
    const turn = await this.turns.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      type: "CUSTOMER_TURN_ENDED",
      speaker: "CUSTOMER",
      transcript,
      latencyMs,
      metadata: {},
      occurredAt: new Date(),
    });
    await this.conversations.update(conversation.id, { currentTurnId: null });
    await this.eventBus.publish("turn.ended", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "CUSTOMER_TURN_ENDED", turnId: turn.id, latencyMs },
    });
  }

  async aiStarted(conversation: RealtimeConversation, voiceResponseId: string): Promise<void> {
    const turn = await this.turns.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      type: "AI_TURN_STARTED",
      speaker: "AI",
      transcript: null,
      latencyMs: null,
      metadata: { voiceResponseId },
      occurredAt: new Date(),
    });
    await this.eventBus.publish("turn.started", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "AI_TURN_STARTED", turnId: turn.id, voiceResponseId },
    });
  }

  async aiEnded(conversation: RealtimeConversation, voiceResponseId: string, latencyMs: number | null): Promise<void> {
    const turn = await this.turns.create({
      organizationId: conversation.organizationId,
      realtimeConversationId: conversation.id,
      callSessionId: conversation.callSessionId,
      type: "AI_TURN_ENDED",
      speaker: "AI",
      transcript: null,
      latencyMs,
      metadata: { voiceResponseId },
      occurredAt: new Date(),
    });
    await this.eventBus.publish("turn.ended", {
      organizationId: conversation.organizationId,
      callSessionId: conversation.callSessionId,
      payload: { type: "AI_TURN_ENDED", turnId: turn.id, voiceResponseId, latencyMs },
    });
  }

  list(realtimeConversationId: string) {
    return this.turns.listByConversation(realtimeConversationId);
  }
}

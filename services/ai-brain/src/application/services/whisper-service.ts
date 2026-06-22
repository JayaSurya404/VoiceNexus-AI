import type { WhisperMessageRepository } from "../ports.js";
import type { WhisperSenderRole, WhisperTarget } from "../../domain/entities/whisper-message.js";
import type { HumanConsoleEventService } from "./human-console-event-service.js";

export class WhisperService {
  constructor(
    private readonly whispers: WhisperMessageRepository,
    private readonly events: HumanConsoleEventService,
  ) {}

  async create(input: {
    organizationId: string;
    sessionId: string;
    senderId: string;
    senderRole: WhisperSenderRole;
    target: WhisperTarget;
    targetAgentId?: string | null;
    content: string;
  }) {
    const whisper = await this.whispers.create({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      target: input.target,
      targetAgentId: input.targetAgentId ?? null,
      content: input.content,
      private: true,
      createdAt: new Date(),
    });
    await this.events.publish("whisper.created", {
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      payload: { whisperId: whisper.id, target: whisper.target, private: true },
    });
    return whisper;
  }
}

import type {
  AiConversationSession,
  AiConversationSessionUpdate,
  NewAiConversationSession,
} from "../../../../domain/entities/ai-conversation-session.js";
import type { AiConversationSessionRepository } from "../../../../application/ports/repositories.js";
import { AiConversationSessionModel } from "../models/ai-conversation-session-model.js";
import { mapAiConversationSession } from "./mappers.js";

export class MongoAiConversationSessionRepository implements AiConversationSessionRepository {
  async create(input: NewAiConversationSession): Promise<AiConversationSession> {
    const document = await AiConversationSessionModel.create(input);
    return mapAiConversationSession(document);
  }

  async findByCallSession(organizationId: string, callSessionId: string): Promise<AiConversationSession | null> {
    const document = await AiConversationSessionModel.findOne({ organizationId, callSessionId }).exec();
    return document ? mapAiConversationSession(document) : null;
  }

  async updateByCallSession(
    organizationId: string,
    callSessionId: string,
    input: AiConversationSessionUpdate,
  ): Promise<AiConversationSession | null> {
    const document = await AiConversationSessionModel.findOneAndUpdate(
      { organizationId, callSessionId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapAiConversationSession(document) : null;
  }
}

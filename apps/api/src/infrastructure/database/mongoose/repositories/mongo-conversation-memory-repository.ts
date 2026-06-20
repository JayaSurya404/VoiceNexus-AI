import type { ConversationMemoryRepository } from "../../../../application/ports/repositories.js";
import type {
  ConversationMemory,
  NewConversationMemory,
} from "../../../../domain/entities/conversation-memory.js";
import { ConversationMemoryModel } from "../models/conversation-memory-model.js";
import { mapConversationMemory } from "./mappers.js";

export class MongoConversationMemoryRepository implements ConversationMemoryRepository {
  async create(input: NewConversationMemory): Promise<ConversationMemory> {
    const document = await ConversationMemoryModel.create(input);
    return mapConversationMemory(document);
  }

  async listByLead(organizationId: string, leadId: string): Promise<ConversationMemory[]> {
    const documents = await ConversationMemoryModel.find({ organizationId, leadId })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapConversationMemory);
  }

  async listImportantByOrganization(organizationId: string): Promise<ConversationMemory[]> {
    const documents = await ConversationMemoryModel.find({ organizationId, importance: { $gte: 4 } })
      .sort({ importance: -1, createdAt: -1 })
      .limit(24)
      .exec();
    return documents.map(mapConversationMemory);
  }
}

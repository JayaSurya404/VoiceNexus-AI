import type {
  WhatsappAutomationRepository,
  WhatsappBroadcastRepository,
  WhatsappContactRepository,
  WhatsappConversationRepository,
  WhatsappMessageRepository,
  WhatsappTemplateRepository,
} from "../../../../application/ports/repositories.js";
import type {
  NewWhatsappAutomation,
  NewWhatsappBroadcast,
  NewWhatsappContact,
  NewWhatsappConversation,
  NewWhatsappMessage,
  NewWhatsappTemplate,
  WhatsappAutomation,
  WhatsappBroadcast,
  WhatsappContact,
  WhatsappContactUpdate,
  WhatsappConversation,
  WhatsappConversationUpdate,
  WhatsappMessage,
  WhatsappTemplate,
} from "../../../../domain/entities/whatsapp.js";
import {
  WhatsappAutomationModel,
  WhatsappBroadcastModel,
  WhatsappContactModel,
  WhatsappConversationModel,
  WhatsappMessageModel,
  WhatsappTemplateModel,
} from "../models/whatsapp-models.js";
import {
  mapWhatsappAutomation,
  mapWhatsappBroadcast,
  mapWhatsappContact,
  mapWhatsappConversation,
  mapWhatsappMessage,
  mapWhatsappTemplate,
} from "./mappers.js";

export class MongoWhatsappContactRepository implements WhatsappContactRepository {
  async create(input: NewWhatsappContact): Promise<WhatsappContact> {
    const document = await WhatsappContactModel.create(input);
    return mapWhatsappContact(document);
  }

  async listByOrganization(organizationId: string, search?: string): Promise<WhatsappContact[]> {
    const filter = search
      ? {
          organizationId,
          $or: [
            { displayName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : { organizationId };
    const documents = await WhatsappContactModel.find(filter).sort({ updatedAt: -1 }).exec();
    return documents.map(mapWhatsappContact);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<WhatsappContact | null> {
    const document = await WhatsappContactModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapWhatsappContact(document) : null;
  }

  async updateForOrganization(
    id: string,
    organizationId: string,
    input: WhatsappContactUpdate,
  ): Promise<WhatsappContact | null> {
    const document = await WhatsappContactModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapWhatsappContact(document) : null;
  }

  async touchLastConversation(id: string, organizationId: string, at: Date): Promise<void> {
    await WhatsappContactModel.updateOne({ _id: id, organizationId }, { $set: { lastConversationAt: at } }).exec();
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return WhatsappContactModel.countDocuments({ organizationId }).exec();
  }
}

export class MongoWhatsappConversationRepository implements WhatsappConversationRepository {
  async create(input: NewWhatsappConversation): Promise<WhatsappConversation> {
    const document = await WhatsappConversationModel.create(input);
    return mapWhatsappConversation(document);
  }

  async listByOrganization(query: {
    organizationId: string;
    search?: string;
    status?: string;
  }): Promise<WhatsappConversation[]> {
    const filter: Record<string, unknown> = { organizationId: query.organizationId };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { subject: { $regex: query.search, $options: "i" } },
        { lastMessagePreview: { $regex: query.search, $options: "i" } },
      ];
    }

    const documents = await WhatsappConversationModel.find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .exec();
    return documents.map(mapWhatsappConversation);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<WhatsappConversation | null> {
    const document = await WhatsappConversationModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapWhatsappConversation(document) : null;
  }

  async updateForOrganization(
    id: string,
    organizationId: string,
    input: WhatsappConversationUpdate,
  ): Promise<WhatsappConversation | null> {
    const document = await WhatsappConversationModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapWhatsappConversation(document) : null;
  }

  async countOpenByOrganization(organizationId: string): Promise<number> {
    return WhatsappConversationModel.countDocuments({ organizationId, status: { $in: ["OPEN", "PENDING"] } }).exec();
  }

  async countUnreadByOrganization(organizationId: string): Promise<number> {
    const result = await WhatsappConversationModel.aggregate<{ total: number }>([
      { $match: { organizationId, unreadCount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$unreadCount" } } },
    ]).exec();
    return result.at(0)?.total ?? 0;
  }

  async countAiEnabledByOrganization(organizationId: string): Promise<number> {
    return WhatsappConversationModel.countDocuments({ organizationId, aiEnabled: true }).exec();
  }
}

export class MongoWhatsappMessageRepository implements WhatsappMessageRepository {
  async create(input: NewWhatsappMessage): Promise<WhatsappMessage> {
    const document = await WhatsappMessageModel.create(input);
    return mapWhatsappMessage(document);
  }

  async listByConversation(organizationId: string, conversationId: string): Promise<WhatsappMessage[]> {
    const documents = await WhatsappMessageModel.find({ organizationId, conversationId })
      .sort({ createdAt: 1 })
      .exec();
    return documents.map(mapWhatsappMessage);
  }
}

export class MongoWhatsappTemplateRepository implements WhatsappTemplateRepository {
  async create(input: NewWhatsappTemplate): Promise<WhatsappTemplate> {
    const document = await WhatsappTemplateModel.create(input);
    return mapWhatsappTemplate(document);
  }

  async listByOrganization(organizationId: string): Promise<WhatsappTemplate[]> {
    const documents = await WhatsappTemplateModel.find({ organizationId }).sort({ updatedAt: -1 }).exec();
    return documents.map(mapWhatsappTemplate);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<WhatsappTemplate | null> {
    const document = await WhatsappTemplateModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapWhatsappTemplate(document) : null;
  }

  async countApprovedByOrganization(organizationId: string): Promise<number> {
    return WhatsappTemplateModel.countDocuments({ organizationId, status: "APPROVED" }).exec();
  }
}

export class MongoWhatsappBroadcastRepository implements WhatsappBroadcastRepository {
  async create(input: NewWhatsappBroadcast): Promise<WhatsappBroadcast> {
    const document = await WhatsappBroadcastModel.create(input);
    return mapWhatsappBroadcast(document);
  }

  async listByOrganization(organizationId: string): Promise<WhatsappBroadcast[]> {
    const documents = await WhatsappBroadcastModel.find({ organizationId }).sort({ createdAt: -1 }).exec();
    return documents.map(mapWhatsappBroadcast);
  }

  async countSentByOrganization(organizationId: string): Promise<number> {
    return WhatsappBroadcastModel.countDocuments({ organizationId, status: "SENT" }).exec();
  }
}

export class MongoWhatsappAutomationRepository implements WhatsappAutomationRepository {
  async create(input: NewWhatsappAutomation): Promise<WhatsappAutomation> {
    const document = await WhatsappAutomationModel.create(input);
    return mapWhatsappAutomation(document);
  }

  async listByOrganization(organizationId: string): Promise<WhatsappAutomation[]> {
    const documents = await WhatsappAutomationModel.find({ organizationId }).sort({ updatedAt: -1 }).exec();
    return documents.map(mapWhatsappAutomation);
  }

  async findEnabledByOrganization(organizationId: string): Promise<WhatsappAutomation[]> {
    const documents = await WhatsappAutomationModel.find({ organizationId, isEnabled: true }).exec();
    return documents.map(mapWhatsappAutomation);
  }
}

import type { CustomerMemoryRepository } from "../../../../application/ports/repositories.js";
import type {
  CustomerMemory,
  NewCustomerMemory,
} from "../../../../domain/entities/customer-memory.js";
import { CustomerMemoryModel } from "../models/customer-memory-model.js";
import { mapCustomerMemory } from "./mappers.js";

export class MongoCustomerMemoryRepository implements CustomerMemoryRepository {
  async upsert(input: NewCustomerMemory): Promise<CustomerMemory> {
    const document = await CustomerMemoryModel.findOneAndUpdate(
      { organizationId: input.organizationId, leadId: input.leadId },
      { $set: input },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();

    return mapCustomerMemory(document);
  }

  async listByOrganization(organizationId: string): Promise<CustomerMemory[]> {
    const documents = await CustomerMemoryModel.find({ organizationId })
      .sort({ lastInteractionAt: -1, updatedAt: -1 })
      .exec();
    return documents.map(mapCustomerMemory);
  }

  async findByLead(organizationId: string, leadId: string): Promise<CustomerMemory | null> {
    const document = await CustomerMemoryModel.findOne({ organizationId, leadId }).exec();
    return document ? mapCustomerMemory(document) : null;
  }
}

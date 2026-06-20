import type { MemoryTagRepository } from "../../../../application/ports/repositories.js";
import type { MemoryTag, NewMemoryTag } from "../../../../domain/entities/memory-tag.js";
import { MemoryTagModel } from "../models/memory-tag-model.js";
import { mapMemoryTag } from "./mappers.js";

export class MongoMemoryTagRepository implements MemoryTagRepository {
  async create(input: NewMemoryTag): Promise<MemoryTag> {
    const document = await MemoryTagModel.create(input);
    return mapMemoryTag(document);
  }

  async listByOrganization(organizationId: string): Promise<MemoryTag[]> {
    const documents = await MemoryTagModel.find({ organizationId }).sort({ name: 1 }).exec();
    return documents.map(mapMemoryTag);
  }

  async findByIdsForOrganization(ids: string[], organizationId: string): Promise<MemoryTag[]> {
    if (ids.length === 0) {
      return [];
    }

    const documents = await MemoryTagModel.find({ _id: { $in: ids }, organizationId }).sort({ name: 1 }).exec();
    return documents.map(mapMemoryTag);
  }
}

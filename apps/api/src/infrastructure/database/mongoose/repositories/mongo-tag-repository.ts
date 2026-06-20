import type { TagRepository, TransactionContext } from "../../../../application/ports/repositories.js";
import type { NewTag, Tag } from "../../../../domain/entities/tag.js";
import { TagModel } from "../models/tag-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapTag } from "./mappers.js";

export class MongoTagRepository implements TagRepository {
  async create(input: NewTag, context?: TransactionContext): Promise<Tag> {
    const [document] = await TagModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("Tag creation did not return a document");
    }

    return mapTag(document);
  }

  async listByOrganization(organizationId: string): Promise<Tag[]> {
    const documents = await TagModel.find({ organizationId }).sort({ name: 1 }).exec();
    return documents.map(mapTag);
  }

  async findByIdsForOrganization(ids: string[], organizationId: string): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    const documents = await TagModel.find({ _id: { $in: ids }, organizationId }).sort({ name: 1 }).exec();
    return documents.map(mapTag);
  }
}

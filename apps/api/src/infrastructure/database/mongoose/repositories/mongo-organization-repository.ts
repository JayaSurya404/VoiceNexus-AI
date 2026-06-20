import type {
  OrganizationRepository,
  TransactionContext,
} from "../../../../application/ports/repositories.js";
import type { NewOrganization, Organization } from "../../../../domain/entities/organization.js";
import { OrganizationModel } from "../models/organization-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapOrganization } from "./mappers.js";

export class MongoOrganizationRepository implements OrganizationRepository {
  async create(input: NewOrganization, context?: TransactionContext): Promise<Organization> {
    const [document] = await OrganizationModel.create([input], {
      session: sessionFromContext(context),
    });

    if (!document) {
      throw new Error("Organization creation did not return a document");
    }

    return mapOrganization(document);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const document = await OrganizationModel.exists({ slug });
    return Boolean(document);
  }

  async findById(id: string): Promise<Organization | null> {
    const document = await OrganizationModel.findById(id).exec();
    return document ? mapOrganization(document) : null;
  }

  async findByIds(ids: string[]): Promise<Organization[]> {
    if (ids.length === 0) {
      return [];
    }

    const documents = await OrganizationModel.find({ _id: { $in: ids } }).sort({ name: 1 }).exec();
    return documents.map(mapOrganization);
  }

  async listAll(): Promise<Organization[]> {
    const documents = await OrganizationModel.find().sort({ createdAt: -1 }).exec();
    return documents.map(mapOrganization);
  }
}

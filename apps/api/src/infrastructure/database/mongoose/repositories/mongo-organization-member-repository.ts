import type {
  OrganizationMemberRepository,
  TransactionContext,
} from "../../../../application/ports/repositories.js";
import type {
  NewOrganizationMember,
  OrganizationMember,
} from "../../../../domain/entities/organization-member.js";
import { OrganizationMemberModel } from "../models/organization-member-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapOrganizationMember } from "./mappers.js";

export class MongoOrganizationMemberRepository implements OrganizationMemberRepository {
  async create(
    input: NewOrganizationMember,
    context?: TransactionContext,
  ): Promise<OrganizationMember> {
    const [document] = await OrganizationMemberModel.create([input], {
      session: sessionFromContext(context),
    });

    if (!document) {
      throw new Error("Organization membership creation did not return a document");
    }

    return mapOrganizationMember(document);
  }

  async findByUser(userId: string): Promise<OrganizationMember[]> {
    const documents = await OrganizationMemberModel.find({ userId }).sort({ createdAt: 1 }).exec();
    return documents.map(mapOrganizationMember);
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null> {
    const document = await OrganizationMemberModel.findOne({ userId, organizationId }).exec();
    return document ? mapOrganizationMember(document) : null;
  }
}

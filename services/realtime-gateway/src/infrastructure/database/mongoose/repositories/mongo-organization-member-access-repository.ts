import type { OrganizationMemberAccessRepository } from "../../../../application/ports/repositories.js";
import { OrganizationMemberModel } from "../models/organization-member-model.js";

export class MongoOrganizationMemberAccessRepository implements OrganizationMemberAccessRepository {
  async hasActiveMembership(userId: string, organizationId: string): Promise<boolean> {
    const document = await OrganizationMemberModel.exists({
      userId,
      organizationId,
      status: "ACTIVE",
    }).exec();
    return Boolean(document);
  }
}

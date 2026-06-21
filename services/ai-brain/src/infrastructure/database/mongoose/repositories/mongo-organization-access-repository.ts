import type { OrganizationAccessRepository } from "../../../../application/ports.js";
import { OrganizationMemberModel } from "../models/external-models.js";
import { objectIdOrThrow } from "./repository-utils.js";

export class MongoOrganizationAccessRepository implements OrganizationAccessRepository {
  async userHasAccess(userId: string, organizationId: string): Promise<boolean> {
    const member = await OrganizationMemberModel.exists({
      organizationId: objectIdOrThrow(organizationId),
      userId: objectIdOrThrow(userId),
      status: "ACTIVE",
    });

    return Boolean(member);
  }
}

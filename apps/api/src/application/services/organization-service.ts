import type { CreateOrganizationPayload, OrganizationDto } from "@voicenexus/contracts";

import { roleByOrganizationId, toOrganizationDto } from "../dto/serializers.js";
import type {
  OrganizationMemberRepository,
  OrganizationRepository,
  TransactionManager,
} from "../ports/repositories.js";
import { AppError } from "../../shared/app-error.js";
import { uniqueSlug } from "../../shared/slug.js";

export interface AuthenticatedActor {
  userId: string;
  platformRole: "SUPER_ADMIN" | null;
}

export class OrganizationService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly members: OrganizationMemberRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async list(actor: AuthenticatedActor): Promise<OrganizationDto[]> {
    if (actor.platformRole === "SUPER_ADMIN") {
      const organizations = await this.organizations.listAll();
      return organizations.map((organization) => toOrganizationDto(organization, "SUPER_ADMIN"));
    }

    const memberships = await this.members.findByUser(actor.userId);
    const activeMemberships = memberships.filter((membership) => membership.status === "ACTIVE");
    const roleByOrgId = roleByOrganizationId(activeMemberships);
    const organizationIds = activeMemberships.map((membership) => membership.organizationId);
    const organizations = await this.organizations.findByIds(organizationIds);

    return organizations.map((organization) =>
      toOrganizationDto(organization, roleByOrgId.get(organization.id) ?? "AGENT"),
    );
  }

  async create(actor: AuthenticatedActor, input: CreateOrganizationPayload): Promise<OrganizationDto> {
    const slug = await uniqueSlug(input.name, async (candidate) =>
      this.organizations.existsBySlug(candidate),
    );

    const organization = await this.transactionManager.run(async (context) => {
      const createdOrganization = await this.organizations.create(
        {
          name: input.name,
          slug,
          status: "ACTIVE",
          timezone: input.timezone,
          createdBy: actor.userId,
        },
        context,
      );

      await this.members.create(
        {
          organizationId: createdOrganization.id,
          userId: actor.userId,
          role: "OWNER",
          status: "ACTIVE",
          invitedBy: null,
          joinedAt: new Date(),
        },
        context,
      );

      return createdOrganization;
    });

    return toOrganizationDto(organization, "OWNER");
  }

  async getById(actor: AuthenticatedActor, organizationId: string): Promise<OrganizationDto> {
    const organization = await this.organizations.findById(organizationId);

    if (!organization) {
      throw AppError.notFound("Organization");
    }

    if (actor.platformRole === "SUPER_ADMIN") {
      return toOrganizationDto(organization, "SUPER_ADMIN");
    }

    const membership = await this.members.findByUserAndOrganization(actor.userId, organization.id);

    if (!membership || membership.status !== "ACTIVE") {
      throw AppError.forbidden("You do not have access to this organization");
    }

    return toOrganizationDto(organization, membership.role);
  }
}

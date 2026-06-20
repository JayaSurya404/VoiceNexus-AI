import type { OrganizationDto, OrganizationRole, UserDto } from "@voicenexus/contracts";

import type { OrganizationMember } from "../../domain/entities/organization-member.js";
import type { Organization } from "../../domain/entities/organization.js";
import type { User } from "../../domain/entities/user.js";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    platformRole: user.platformRole,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toOrganizationDto(
  organization: Organization,
  role: OrganizationDto["role"],
): OrganizationDto {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    status: organization.status,
    timezone: organization.timezone,
    role,
    createdAt: organization.createdAt.toISOString(),
  };
}

export function roleByOrganizationId(
  memberships: OrganizationMember[],
): Map<string, OrganizationRole> {
  return new Map(
    memberships
      .filter((membership) => membership.status === "ACTIVE")
      .map((membership) => [membership.organizationId, membership.role]),
  );
}

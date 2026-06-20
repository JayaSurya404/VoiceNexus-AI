import type { OrganizationRole, PlatformRole } from "@voicenexus/contracts";

export const permissions = [
  "organization:read",
  "organization:update",
  "organization:delete",
  "member:read",
  "member:manage",
  "conversation:read",
  "conversation:handle",
  "campaign:manage",
  "agent:manage",
] as const;

export type Permission = (typeof permissions)[number];

const rolePermissions: Record<OrganizationRole, ReadonlySet<Permission>> = {
  OWNER: new Set(permissions),
  MANAGER: new Set([
    "organization:read",
    "member:read",
    "conversation:read",
    "conversation:handle",
    "campaign:manage",
    "agent:manage",
  ]),
  AGENT: new Set(["organization:read", "conversation:read", "conversation:handle"]),
};

export function hasPermission(
  platformRole: PlatformRole | null,
  organizationRole: OrganizationRole | null,
  permission: Permission,
): boolean {
  if (platformRole === "SUPER_ADMIN") {
    return true;
  }

  return organizationRole !== null && rolePermissions[organizationRole].has(permission);
}

import type { OrganizationMember } from "../../../../domain/entities/organization-member.js";
import type { Organization } from "../../../../domain/entities/organization.js";
import type { RefreshSession } from "../../../../domain/entities/refresh-session.js";
import type { User } from "../../../../domain/entities/user.js";
import type { OrganizationMemberMongoDocument } from "../models/organization-member-model.js";
import type { OrganizationMongoDocument } from "../models/organization-model.js";
import type { RefreshSessionMongoDocument } from "../models/refresh-session-model.js";
import type { UserMongoDocument } from "../models/user-model.js";

export function mapUser(document: UserMongoDocument): User {
  return {
    id: document._id.toString(),
    email: document.email,
    firstName: document.firstName,
    lastName: document.lastName,
    passwordHash: document.passwordHash,
    platformRole: document.platformRole,
    status: document.status,
    lastLoginAt: document.lastLoginAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganization(document: OrganizationMongoDocument): Organization {
  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    status: document.status,
    timezone: document.timezone,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganizationMember(
  document: OrganizationMemberMongoDocument,
): OrganizationMember {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    userId: document.userId.toHexString(),
    role: document.role,
    status: document.status,
    invitedBy: document.invitedBy?.toHexString() ?? null,
    joinedAt: document.joinedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapRefreshSession(document: RefreshSessionMongoDocument): RefreshSession {
  return {
    id: document._id.toString(),
    tokenId: document.tokenId,
    familyId: document.familyId,
    userId: document.userId.toHexString(),
    tokenHash: document.tokenHash,
    expiresAt: document.expiresAt,
    revokedAt: document.revokedAt,
    replacedByTokenId: document.replacedByTokenId,
    userAgent: document.userAgent,
    ipHash: document.ipHash,
    createdAt: document.createdAt,
  };
}

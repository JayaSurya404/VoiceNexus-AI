import type {
  NewOrganizationMember,
  OrganizationMember,
} from "../../domain/entities/organization-member.js";
import type {
  NewOrganization,
  Organization,
} from "../../domain/entities/organization.js";
import type {
  NewRefreshSession,
  RefreshSession,
} from "../../domain/entities/refresh-session.js";
import type { NewUser, User } from "../../domain/entities/user.js";

export type TransactionContext = object;

export interface TransactionManager {
  run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}

export interface UserRepository {
  create(input: NewUser, context?: TransactionContext): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string, at: Date): Promise<void>;
}

export interface OrganizationRepository {
  create(input: NewOrganization, context?: TransactionContext): Promise<Organization>;
  existsBySlug(slug: string): Promise<boolean>;
  findById(id: string): Promise<Organization | null>;
  findByIds(ids: string[]): Promise<Organization[]>;
  listAll(): Promise<Organization[]>;
}

export interface OrganizationMemberRepository {
  create(
    input: NewOrganizationMember,
    context?: TransactionContext,
  ): Promise<OrganizationMember>;
  findByUser(userId: string): Promise<OrganizationMember[]>;
  findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null>;
}

export interface RefreshSessionRepository {
  create(input: NewRefreshSession): Promise<RefreshSession>;
  consumeForRotation(
    tokenId: string,
    tokenHash: string,
    replacedByTokenId: string,
    now: Date,
  ): Promise<RefreshSession | null>;
  findByTokenId(tokenId: string): Promise<RefreshSession | null>;
  revokeByTokenId(tokenId: string, at: Date): Promise<void>;
  revokeFamily(familyId: string, at: Date): Promise<void>;
}

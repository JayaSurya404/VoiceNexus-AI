import { randomUUID } from "node:crypto";

import type { AuthResponse, LoginPayload, RefreshPayload, RegisterPayload } from "@voicenexus/contracts";

import { toOrganizationDto, toUserDto } from "../dto/serializers.js";
import type {
  OrganizationMemberRepository,
  OrganizationRepository,
  RefreshSessionRepository,
  TransactionManager,
  UserRepository,
} from "../ports/repositories.js";
import type { PasswordHasher, TokenPair, TokenService } from "../ports/security.js";
import { AppError } from "../../shared/app-error.js";
import { sha256 } from "../../shared/hash.js";
import { uniqueSlug } from "../../shared/slug.js";
import type { User } from "../../domain/entities/user.js";

export interface AuthClientContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuthOperationResult {
  response: AuthResponse;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly organizations: OrganizationRepository,
    private readonly members: OrganizationMemberRepository,
    private readonly refreshSessions: RefreshSessionRepository,
    private readonly transactionManager: TransactionManager,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async register(input: RegisterPayload, client: AuthClientContext): Promise<AuthOperationResult> {
    const exists = await this.users.existsByEmail(input.email);

    if (exists) {
      throw AppError.conflict("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const { user, organization } = await this.transactionManager.run(async (context) => {
      const createdUser = await this.users.create(
        {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          passwordHash,
          platformRole: null,
          status: "ACTIVE",
        },
        context,
      );

      const slug = await this.generateOrganizationSlug(input.organizationName);

      const createdOrganization = await this.organizations.create(
        {
          name: input.organizationName,
          slug,
          status: "ACTIVE",
          timezone: "UTC",
          createdBy: createdUser.id,
        },
        context,
      );

      await this.members.create(
        {
          organizationId: createdOrganization.id,
          userId: createdUser.id,
          role: "OWNER",
          status: "ACTIVE",
          invitedBy: null,
          joinedAt: new Date(),
        },
        context,
      );

      return { user: createdUser, organization: createdOrganization };
    });

    const tokenPair = this.tokenService.issueTokenPair(user);
    await this.persistRefreshSession(tokenPair, user.id, client);

    return {
      response: {
        accessToken: tokenPair.accessToken,
        expiresIn: tokenPair.expiresIn,
        user: toUserDto(user),
        organizations: [toOrganizationDto(organization, "OWNER")],
      },
      refreshToken: tokenPair.refreshToken,
    };
  }

  async login(input: LoginPayload, client: AuthClientContext): Promise<AuthOperationResult> {
    const user = await this.users.findByEmailWithPassword(input.email);

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw AppError.forbidden("This account is not active");
    }

    await this.users.updateLastLogin(user.id, new Date());

    const tokenPair = this.tokenService.issueTokenPair(user);
    await this.persistRefreshSession(tokenPair, user.id, client);

    return {
      response: await this.buildAuthResponse(user, tokenPair.accessToken, tokenPair.expiresIn),
      refreshToken: tokenPair.refreshToken,
    };
  }

  async refresh(input: RefreshPayload, client: AuthClientContext): Promise<AuthOperationResult> {
    const refreshToken = input.refreshToken;

    if (!refreshToken) {
      throw AppError.unauthorized("Refresh token is missing");
    }

    const claims = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const user = await this.users.findById(claims.userId);

    if (!user || user.status !== "ACTIVE") {
      await this.refreshSessions.revokeFamily(claims.familyId, new Date());
      throw AppError.unauthorized("Refresh token is no longer valid");
    }

    const tokenPair = this.tokenService.issueTokenPair(user, claims.familyId);
    const consumed = await this.refreshSessions.consumeForRotation(
      claims.tokenId,
      tokenHash,
      tokenPair.refreshTokenId,
      new Date(),
    );

    if (!consumed) {
      await this.refreshSessions.revokeFamily(claims.familyId, new Date());
      throw AppError.unauthorized("Refresh token is no longer valid");
    }

    await this.persistRefreshSession(tokenPair, user.id, client);

    return {
      response: await this.buildAuthResponse(user, tokenPair.accessToken, tokenPair.expiresIn),
      refreshToken: tokenPair.refreshToken,
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const claims = this.tokenService.verifyRefreshToken(refreshToken);
      await this.refreshSessions.revokeByTokenId(claims.tokenId, new Date());
    } catch {
      return;
    }
  }

  private async buildAuthResponse(
    user: User,
    accessToken: string,
    expiresIn: number,
  ): Promise<AuthResponse> {
    const memberships = await this.members.findByUser(user.id);
    const organizationIds = memberships
      .filter((membership) => membership.status === "ACTIVE")
      .map((membership) => membership.organizationId);
    const organizations = await this.organizations.findByIds(organizationIds);
    const roleByOrgId = new Map(
      memberships
        .filter((membership) => membership.status === "ACTIVE")
        .map((membership) => [membership.organizationId, membership.role]),
    );

    return {
      accessToken,
      expiresIn,
      user: toUserDto(user),
      organizations: organizations.map((organization) =>
        toOrganizationDto(organization, roleByOrgId.get(organization.id) ?? "AGENT"),
      ),
    };
  }

  private async persistRefreshSession(
    tokenPair: TokenPair,
    userId: string,
    client: AuthClientContext,
  ): Promise<void> {
    await this.refreshSessions.create({
      tokenId: tokenPair.refreshTokenId,
      familyId: tokenPair.refreshFamilyId,
      userId,
      tokenHash: sha256(tokenPair.refreshToken),
      expiresAt: tokenPair.refreshExpiresAt,
      userAgent: client.userAgent,
      ipHash: client.ipAddress ? sha256(client.ipAddress) : null,
    });
  }

  private async generateOrganizationSlug(name: string): Promise<string> {
    return uniqueSlug(name, async (candidate) => this.organizations.existsBySlug(candidate), randomUUID);
  }
}

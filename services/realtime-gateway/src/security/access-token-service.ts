import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { OrganizationMemberAccessRepository } from "../application/ports/repositories.js";
import { RealtimeError } from "../shared/errors.js";

export interface AccessTokenClaims {
  userId: string;
  email: string;
  platformRole: "SUPER_ADMIN" | null;
}

export class AccessTokenService {
  constructor(private readonly members: OrganizationMemberAccessRepository) {}

  verify(token: string): AccessTokenClaims {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      if (typeof payload === "string") {
        throw RealtimeError.unauthorized("Access token is invalid");
      }

      const claims = payload as Record<string, unknown>;

      if (
        typeof claims.userId !== "string" ||
        typeof claims.email !== "string" ||
        (claims.platformRole !== null && claims.platformRole !== "SUPER_ADMIN")
      ) {
        throw RealtimeError.unauthorized("Access token is invalid");
      }

      return {
        userId: claims.userId,
        email: claims.email,
        platformRole: claims.platformRole,
      };
    } catch (error) {
      if (error instanceof RealtimeError) {
        throw error;
      }

      throw RealtimeError.unauthorized("Access token is invalid or expired");
    }
  }

  async ensureOrganizationAccess(token: string, organizationId: string): Promise<AccessTokenClaims> {
    const claims = this.verify(token);

    if (claims.platformRole === "SUPER_ADMIN") {
      return claims;
    }

    const hasAccess = await this.members.hasActiveMembership(claims.userId, organizationId);

    if (!hasAccess) {
      throw RealtimeError.forbidden("You do not have access to this organization");
    }

    return claims;
  }
}

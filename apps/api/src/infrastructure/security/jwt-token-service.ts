import { randomUUID } from "node:crypto";

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import type {
  AccessTokenClaims,
  RefreshTokenClaims,
  TokenPair,
  TokenService,
} from "../../application/ports/security.js";
import type { User } from "../../domain/entities/user.js";
import { AppError } from "../../shared/app-error.js";

export interface JwtTokenServiceOptions {
  accessSecret: string;
  refreshSecret: string;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

export class JwtTokenService implements TokenService {
  constructor(private readonly options: JwtTokenServiceOptions) {}

  issueTokenPair(user: User, familyId = randomUUID()): TokenPair {
    const tokenId = randomUUID();
    const issuedAtSeconds = Math.floor(Date.now() / 1000);
    const refreshExpiresAt = new Date(
      (issuedAtSeconds + this.options.refreshTtlSeconds) * 1000,
    );

    const accessPayload: AccessTokenClaims = {
      userId: user.id,
      email: user.email,
      platformRole: user.platformRole,
    };

    const refreshPayload: RefreshTokenClaims = {
      userId: user.id,
      tokenId,
      familyId,
    };

    const commonOptions: Pick<SignOptions, "issuer" | "audience"> = {
      issuer: this.options.issuer,
      audience: this.options.audience,
    };

    return {
      accessToken: jwt.sign(accessPayload, this.options.accessSecret, {
        ...commonOptions,
        subject: user.id,
        expiresIn: this.options.accessTtlSeconds,
      }),
      refreshToken: jwt.sign(refreshPayload, this.options.refreshSecret, {
        ...commonOptions,
        subject: user.id,
        expiresIn: this.options.refreshTtlSeconds,
        jwtid: tokenId,
      }),
      expiresIn: this.options.accessTtlSeconds,
      refreshTokenId: tokenId,
      refreshFamilyId: familyId,
      refreshExpiresAt,
    };
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    const payload = this.verify(token, this.options.accessSecret);
    const claims = payload as Record<string, unknown>;
    const userId = claims.userId;
    const email = claims.email;
    const platformRole = claims.platformRole;

    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      (platformRole !== null && platformRole !== "SUPER_ADMIN")
    ) {
      throw AppError.unauthorized("Access token is invalid");
    }

    return {
      userId,
      email,
      platformRole,
    };
  }

  verifyRefreshToken(token: string): RefreshTokenClaims {
    const payload = this.verify(token, this.options.refreshSecret);
    const claims = payload as Record<string, unknown>;
    const userId = claims.userId;
    const tokenId = claims.tokenId;
    const familyId = claims.familyId;

    if (
      typeof userId !== "string" ||
      typeof tokenId !== "string" ||
      typeof familyId !== "string"
    ) {
      throw AppError.unauthorized("Refresh token is invalid");
    }

    return {
      userId,
      tokenId,
      familyId,
    };
  }

  private verify(token: string, secret: string): JwtPayload {
    try {
      const payload = jwt.verify(token, secret, {
        issuer: this.options.issuer,
        audience: this.options.audience,
      });

      if (typeof payload === "string") {
        throw AppError.unauthorized("Token is invalid");
      }

      return payload;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.unauthorized("Token is invalid or expired");
    }
  }
}

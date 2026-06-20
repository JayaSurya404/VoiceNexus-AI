import type { PlatformRole } from "@voicenexus/contracts";

export interface PasswordHasher {
  hash(value: string): Promise<string>;
  compare(value: string, hash: string): Promise<boolean>;
}

export interface AccessTokenClaims {
  userId: string;
  email: string;
  platformRole: PlatformRole | null;
}

export interface RefreshTokenClaims {
  userId: string;
  tokenId: string;
  familyId: string;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: Date;
  refreshTokenId: string;
  refreshFamilyId: string;
}

export interface TokenService {
  issueTokenPair(user: {
    id: string;
    email: string;
    platformRole: PlatformRole | null;
  }, familyId?: string): TokenPair;
  verifyAccessToken(token: string): AccessTokenClaims;
  verifyRefreshToken(token: string): RefreshTokenClaims;
}

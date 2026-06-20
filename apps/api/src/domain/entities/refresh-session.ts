export interface RefreshSession {
  id: string;
  tokenId: string;
  familyId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: Date;
}

export interface NewRefreshSession {
  tokenId: string;
  familyId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipHash: string | null;
}

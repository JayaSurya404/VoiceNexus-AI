import { createHash, randomBytes } from "node:crypto";

import type { ApiKey, ApiKeyType } from "../../domain/entities/api-key.js";
import type { ApiKeyRepository, AuditLogRepository } from "../ports.js";

export interface CreatedApiKey {
  apiKey: ApiKey;
  secret: string;
}

const prefixFor = (type: ApiKeyType) => (type === "PUBLIC" ? "vn_pk" : "vn_sk");

const hashKey = (value: string) => createHash("sha256").update(value).digest("hex");

export class ApiKeyService {
  constructor(
    private readonly apiKeys: ApiKeyRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async list(organizationId: string): Promise<ApiKey[]> {
    return this.apiKeys.listByOrganization(organizationId);
  }

  async create(input: {
    organizationId: string;
    name: string;
    type: ApiKeyType;
    scopes?: string[];
    expiresAt?: Date | null;
    createdBy?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<CreatedApiKey> {
    const secret = `${prefixFor(input.type)}_${randomBytes(24).toString("hex")}`;
    const apiKey = await this.apiKeys.create({
      organizationId: input.organizationId,
      name: input.name,
      type: input.type,
      keyPrefix: secret.slice(0, 12),
      keyHash: hashKey(secret),
      scopes: input.scopes ?? [],
      lastUsedAt: null,
      expiresAt: input.expiresAt ?? null,
      revokedAt: null,
      createdBy: input.createdBy ?? null,
      metadata: input.metadata ?? {},
    });
    await this.auditLogs.create({
      organizationId: input.organizationId,
      actorId: input.createdBy ?? null,
      actorType: "USER",
      action: "api_key.created",
      resourceType: "api_key",
      resourceId: apiKey.id,
      ipAddress: null,
      userAgent: null,
      metadata: { name: input.name, type: input.type },
    });
    return { apiKey, secret };
  }

  async revoke(id: string, organizationId: string): Promise<ApiKey | null> {
    const revoked = await this.apiKeys.revoke(id, organizationId, new Date());
    if (revoked) {
      await this.auditLogs.create({
        organizationId,
        actorId: null,
        actorType: "SYSTEM",
        action: "api_key.revoked",
        resourceType: "api_key",
        resourceId: revoked.id,
        ipAddress: null,
        userAgent: null,
        metadata: {},
      });
    }
    return revoked;
  }
}

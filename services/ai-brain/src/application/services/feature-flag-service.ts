import type { FeatureFlag, GovernanceFeatureFlagKey } from "../../domain/entities/feature-flag.js";
import type { AuditLogRepository, FeatureFlagRepository } from "../ports.js";

const DEFAULT_FLAGS: GovernanceFeatureFlagKey[] = [
  "ai_calling",
  "whatsapp",
  "crm",
  "memory",
  "automation",
  "analytics",
  "rag",
  "optimization",
];

export class FeatureFlagService {
  constructor(
    private readonly featureFlags: FeatureFlagRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async list(organizationId: string): Promise<FeatureFlag[]> {
    const flags = await this.featureFlags.listByOrganization(organizationId);
    if (flags.length >= DEFAULT_FLAGS.length) {
      return flags;
    }

    await Promise.all(
      DEFAULT_FLAGS.map((key) =>
        this.featureFlags.upsert(organizationId, key, {
          enabled: key !== "whatsapp",
          rolloutPercentage: key === "whatsapp" ? 0 : 100,
          metadata: {},
        }),
      ),
    );
    return this.featureFlags.listByOrganization(organizationId);
  }

  async update(organizationId: string, key: GovernanceFeatureFlagKey, enabled: boolean, rolloutPercentage = enabled ? 100 : 0): Promise<FeatureFlag> {
    const flag = await this.featureFlags.upsert(organizationId, key, {
      enabled,
      rolloutPercentage,
      metadata: {},
    });
    await this.auditLogs.create({
      organizationId,
      actorId: null,
      actorType: "SYSTEM",
      action: "feature_flag.updated",
      resourceType: "feature_flag",
      resourceId: flag.id,
      ipAddress: null,
      userAgent: null,
      metadata: { key, enabled, rolloutPercentage },
    });
    return flag;
  }
}

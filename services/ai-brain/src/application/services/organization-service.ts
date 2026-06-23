import type { Organization } from "../../domain/entities/organization.js";
import type {
  AuditLogRepository,
  FeatureFlagRepository,
  OrganizationRepository,
  OrganizationSettingsRepository,
} from "../ports.js";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class OrganizationService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly settings: OrganizationSettingsRepository,
    private readonly featureFlags: FeatureFlagRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async list(): Promise<Organization[]> {
    return this.organizations.list();
  }

  async get(id: string): Promise<Organization | null> {
    return this.organizations.findById(id);
  }

  async create(input: {
    name: string;
    ownerUserId?: string | null;
    primaryEmail?: string | null;
    timezone?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Organization> {
    const organization = await this.organizations.create({
      name: input.name,
      slug: slugify(input.name),
      status: "TRIAL",
      ownerUserId: input.ownerUserId ?? null,
      primaryEmail: input.primaryEmail ?? null,
      timezone: input.timezone ?? "UTC",
      metadata: input.metadata ?? {},
    });

    await this.settings.upsert(organization.id, {
      timezone: organization.timezone,
      metadata: {},
    });
    await Promise.all(
      (["ai_calling", "crm", "memory", "automation", "analytics", "rag", "optimization"] as const).map((key) =>
        this.featureFlags.upsert(organization.id, key, {
          enabled: true,
          rolloutPercentage: 100,
          metadata: {},
        }),
      ),
    );
    await this.featureFlags.upsert(organization.id, "whatsapp", {
      enabled: false,
      rolloutPercentage: 0,
      metadata: {},
    });
    await this.auditLogs.create({
      organizationId: organization.id,
      actorId: input.ownerUserId ?? null,
      actorType: "USER",
      action: "organization.created",
      resourceType: "organization",
      resourceId: organization.id,
      ipAddress: null,
      userAgent: null,
      metadata: { name: organization.name },
    });

    return organization;
  }

  async update(
    id: string,
    input: Partial<Pick<Organization, "name" | "primaryEmail" | "timezone" | "metadata">>,
  ): Promise<Organization | null> {
    const updated = await this.organizations.update(id, {
      ...input,
      ...(input.name ? { slug: slugify(input.name) } : {}),
    });
    if (updated) {
      await this.auditLogs.create({
        organizationId: updated.id,
        actorId: null,
        actorType: "SYSTEM",
        action: "organization.updated",
        resourceType: "organization",
        resourceId: updated.id,
        ipAddress: null,
        userAgent: null,
        metadata: input,
      });
    }
    return updated;
  }

  async suspend(id: string): Promise<Organization | null> {
    const updated = await this.organizations.update(id, { status: "SUSPENDED" });
    if (updated) {
      await this.auditLogs.create({
        organizationId: updated.id,
        actorId: null,
        actorType: "SYSTEM",
        action: "organization.suspended",
        resourceType: "organization",
        resourceId: updated.id,
        ipAddress: null,
        userAgent: null,
        metadata: {},
      });
    }
    return updated;
  }

  async activate(id: string): Promise<Organization | null> {
    const updated = await this.organizations.update(id, { status: "ACTIVE" });
    if (updated) {
      await this.auditLogs.create({
        organizationId: updated.id,
        actorId: null,
        actorType: "SYSTEM",
        action: "organization.activated",
        resourceType: "organization",
        resourceId: updated.id,
        ipAddress: null,
        userAgent: null,
        metadata: {},
      });
    }
    return updated;
  }
}

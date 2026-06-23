import type { AnyBulkWriteOperation } from "mongoose";

import type { ApiKey } from "../../../../domain/entities/api-key.js";
import type { AuditLog } from "../../../../domain/entities/audit-log.js";
import type { BillingAccount } from "../../../../domain/entities/billing-account.js";
import type { BillingEvent } from "../../../../domain/entities/billing-event.js";
import type { FeatureFlag, GovernanceFeatureFlagKey } from "../../../../domain/entities/feature-flag.js";
import type { Invoice } from "../../../../domain/entities/invoice.js";
import type { Organization } from "../../../../domain/entities/organization.js";
import type { OrganizationSettings } from "../../../../domain/entities/organization-settings.js";
import type { Payment } from "../../../../domain/entities/payment.js";
import type { Subscription } from "../../../../domain/entities/subscription.js";
import type { SubscriptionPlan, SubscriptionPlanTier } from "../../../../domain/entities/subscription-plan.js";
import type { UsageRecord, UsageRecordMetric } from "../../../../domain/entities/usage-record.js";
import type {
  ApiKeyRepository,
  AuditLogRepository,
  BillingAccountRepository,
  BillingEventRepository,
  FeatureFlagRepository,
  InvoiceRepository,
  OrganizationRepository,
  OrganizationSettingsRepository,
  PaymentRepository,
  SubscriptionPlanRepository,
  SubscriptionRepository,
  UsageRecordRepository,
} from "../../../../application/ports.js";
import { ApiKeyModel } from "../models/api-key-model.js";
import { AuditLogModel } from "../models/audit-log-model.js";
import { BillingAccountModel } from "../models/billing-account-model.js";
import { BillingEventModel } from "../models/billing-event-model.js";
import { FeatureFlagModel } from "../models/feature-flag-model.js";
import { InvoiceModel } from "../models/invoice-model.js";
import { OrganizationModel } from "../models/organization-model.js";
import { OrganizationSettingsModel } from "../models/organization-settings-model.js";
import { PaymentModel } from "../models/payment-model.js";
import { SubscriptionModel } from "../models/subscription-model.js";
import { SubscriptionPlanModel } from "../models/subscription-plan-model.js";
import { UsageRecordModel } from "../models/usage-record-model.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type Doc = Record<string, any>;

const asId = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  return String(value);
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const asDate = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));

const toOrganization = (doc: Doc): Organization => ({
  id: String(doc._id),
  name: String(doc.name),
  slug: String(doc.slug),
  status: doc.status,
  ownerUserId: doc.ownerUserId ?? null,
  primaryEmail: doc.primaryEmail ?? null,
  timezone: String(doc.timezone ?? "UTC"),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toOrganizationSettings = (doc: Doc): OrganizationSettings => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  defaultLocale: String(doc.defaultLocale ?? "en-US"),
  timezone: String(doc.timezone ?? "UTC"),
  dataRetentionDays: Number(doc.dataRetentionDays ?? 365),
  allowedDomains: Array.isArray(doc.allowedDomains) ? doc.allowedDomains.map(String) : [],
  security: {
    ssoRequired: Boolean(doc.security?.ssoRequired),
    mfaRequired: Boolean(doc.security?.mfaRequired),
    apiKeyRotationDays: Number(doc.security?.apiKeyRotationDays ?? 90),
  },
  notifications: {
    billingAlerts: doc.notifications?.billingAlerts !== false,
    usageAlerts: doc.notifications?.usageAlerts !== false,
    auditAlerts: doc.notifications?.auditAlerts !== false,
  },
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const defaultLimits = {
  seats: 1,
  calls: 100,
  minutes: 500,
  messages: 500,
  aiRequests: 1000,
  storageGb: 1,
  workflowExecutions: 100,
};

const toSubscriptionPlan = (doc: Doc): SubscriptionPlan => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  tier: doc.tier,
  name: String(doc.name),
  description: String(doc.description ?? ""),
  monthlyPriceCents: Number(doc.monthlyPriceCents ?? 0),
  limits: { ...defaultLimits, ...asRecord(doc.limits) },
  features: Array.isArray(doc.features) ? doc.features.map(String) : [],
  active: Boolean(doc.active),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toSubscription = (doc: Doc): Subscription => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  planId: String(doc.planId),
  tier: doc.tier,
  status: doc.status,
  seats: Number(doc.seats ?? 1),
  currentPeriodStart: asDate(doc.currentPeriodStart),
  currentPeriodEnd: asDate(doc.currentPeriodEnd),
  entitlements: { ...defaultLimits, ...asRecord(doc.entitlements) },
  cancelAtPeriodEnd: Boolean(doc.cancelAtPeriodEnd),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toBillingAccount = (doc: Doc): BillingAccount => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  billingEmail: String(doc.billingEmail),
  currency: String(doc.currency ?? "USD"),
  balanceCents: Number(doc.balanceCents ?? 0),
  creditCents: Number(doc.creditCents ?? 0),
  paymentProvider: doc.paymentProvider ?? null,
  providerCustomerId: doc.providerCustomerId ?? null,
  taxId: doc.taxId ?? null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toBillingEvent = (doc: Doc): BillingEvent => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  billingAccountId: asId(doc.billingAccountId),
  type: doc.type,
  amountCents: Number(doc.amountCents ?? 0),
  currency: String(doc.currency ?? "USD"),
  description: String(doc.description ?? ""),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
});

const toInvoice = (doc: Doc): Invoice => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  billingAccountId: String(doc.billingAccountId),
  invoiceNumber: String(doc.invoiceNumber),
  status: doc.status,
  currency: String(doc.currency ?? "USD"),
  subtotalCents: Number(doc.subtotalCents ?? 0),
  taxCents: Number(doc.taxCents ?? 0),
  totalCents: Number(doc.totalCents ?? 0),
  balanceDueCents: Number(doc.balanceDueCents ?? 0),
  issuedAt: asDate(doc.issuedAt),
  dueAt: doc.dueAt ? asDate(doc.dueAt) : null,
  paidAt: doc.paidAt ? asDate(doc.paidAt) : null,
  lineItems: Array.isArray(doc.lineItems) ? doc.lineItems.map((item: unknown) => item as Invoice["lineItems"][number]) : [],
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toPayment = (doc: Doc): Payment => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  billingAccountId: String(doc.billingAccountId),
  invoiceId: asId(doc.invoiceId),
  status: doc.status,
  amountCents: Number(doc.amountCents ?? 0),
  currency: String(doc.currency ?? "USD"),
  provider: doc.provider ?? null,
  providerPaymentId: doc.providerPaymentId ?? null,
  failureReason: doc.failureReason ?? null,
  paidAt: doc.paidAt ? asDate(doc.paidAt) : null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toApiKey = (doc: Doc): ApiKey => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  name: String(doc.name),
  type: doc.type,
  keyPrefix: String(doc.keyPrefix),
  keyHash: String(doc.keyHash),
  scopes: Array.isArray(doc.scopes) ? doc.scopes.map(String) : [],
  lastUsedAt: doc.lastUsedAt ? asDate(doc.lastUsedAt) : null,
  expiresAt: doc.expiresAt ? asDate(doc.expiresAt) : null,
  revokedAt: doc.revokedAt ? asDate(doc.revokedAt) : null,
  createdBy: doc.createdBy ?? null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toAuditLog = (doc: Doc): AuditLog => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  actorId: doc.actorId ?? null,
  actorType: doc.actorType,
  action: String(doc.action),
  resourceType: String(doc.resourceType),
  resourceId: doc.resourceId ?? null,
  ipAddress: doc.ipAddress ?? null,
  userAgent: doc.userAgent ?? null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
});

const toFeatureFlag = (doc: Doc): FeatureFlag => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  key: doc.key,
  enabled: Boolean(doc.enabled),
  rolloutPercentage: Number(doc.rolloutPercentage ?? 0),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toUsageRecord = (doc: Doc): UsageRecord => ({
  id: String(doc._id),
  organizationId: String(doc.organizationId),
  metric: doc.metric,
  quantity: Number(doc.quantity ?? 0),
  unit: String(doc.unit),
  source: String(doc.source ?? "system"),
  occurredAt: asDate(doc.occurredAt),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

export class MongoOrganizationRepository implements OrganizationRepository {
  async create(input: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    return toOrganization(await OrganizationModel.create(input));
  }

  async findById(id: string): Promise<Organization | null> {
    const doc = await OrganizationModel.findById(objectIdOrThrow(id)).lean();
    return doc ? toOrganization(doc) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const doc = await OrganizationModel.findOne({ slug }).lean();
    return doc ? toOrganization(doc) : null;
  }

  async list(): Promise<Organization[]> {
    const docs = await OrganizationModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toOrganization);
  }

  async update(id: string, input: Partial<Omit<Organization, "id" | "createdAt" | "updatedAt">>): Promise<Organization | null> {
    const doc = await OrganizationModel.findByIdAndUpdate(objectIdOrThrow(id), { $set: input }, { new: true }).lean();
    return doc ? toOrganization(doc) : null;
  }
}

export class MongoOrganizationSettingsRepository implements OrganizationSettingsRepository {
  async findByOrganization(organizationId: string): Promise<OrganizationSettings | null> {
    const doc = await OrganizationSettingsModel.findOne({ organizationId: objectId(organizationId) }).lean();
    return doc ? toOrganizationSettings(doc) : null;
  }

  async upsert(
    organizationId: string,
    input: Partial<Omit<OrganizationSettings, "id" | "organizationId" | "createdAt" | "updatedAt">>,
  ): Promise<OrganizationSettings> {
    const doc = await OrganizationSettingsModel.findOneAndUpdate(
      { organizationId: objectId(organizationId) },
      { $set: input, $setOnInsert: { organizationId: objectId(organizationId) } },
      { new: true, upsert: true },
    ).lean();
    if (!doc || Array.isArray(doc)) {
      throw new Error("Organization settings upsert did not return a document");
    }
    return toOrganizationSettings(doc);
  }
}

export class MongoSubscriptionPlanRepository implements SubscriptionPlanRepository {
  async create(input: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionPlan> {
    return toSubscriptionPlan(await SubscriptionPlanModel.create(input));
  }

  async findByTier(tier: SubscriptionPlanTier, organizationId: string | null = null): Promise<SubscriptionPlan | null> {
    const doc = await SubscriptionPlanModel.findOne({ tier, organizationId: organizationId ? objectId(organizationId) : null, active: true }).lean();
    return doc ? toSubscriptionPlan(doc) : null;
  }

  async list(organizationId: string | null = null): Promise<SubscriptionPlan[]> {
    const docs = await SubscriptionPlanModel.find({
      active: true,
      $or: [{ organizationId: null }, ...(organizationId ? [{ organizationId: objectId(organizationId) }] : [])],
    }).sort({ monthlyPriceCents: 1 }).lean();
    return docs.map(toSubscriptionPlan);
  }
}

export class MongoSubscriptionRepository implements SubscriptionRepository {
  async create(input: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription> {
    return toSubscription(await SubscriptionModel.create(input));
  }

  async findByOrganization(organizationId: string): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return doc ? toSubscription(doc) : null;
  }

  async listByOrganization(organizationId: string): Promise<Subscription[]> {
    const docs = await SubscriptionModel.find({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return docs.map(toSubscription);
  }

  async update(id: string, organizationId: string, input: Partial<Omit<Subscription, "id" | "organizationId" | "createdAt" | "updatedAt">>): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOneAndUpdate({ _id: objectIdOrThrow(id), organizationId: objectId(organizationId) }, { $set: input }, { new: true }).lean();
    return doc ? toSubscription(doc) : null;
  }
}

export class MongoBillingAccountRepository implements BillingAccountRepository {
  async findByOrganization(organizationId: string): Promise<BillingAccount | null> {
    const doc = await BillingAccountModel.findOne({ organizationId: objectId(organizationId) }).lean();
    return doc ? toBillingAccount(doc) : null;
  }

  async upsert(organizationId: string, input: Partial<Omit<BillingAccount, "id" | "organizationId" | "createdAt" | "updatedAt">>): Promise<BillingAccount> {
    const doc = await BillingAccountModel.findOneAndUpdate(
      { organizationId: objectId(organizationId) },
      { $set: input, $setOnInsert: { organizationId: objectId(organizationId) } },
      { new: true, upsert: true },
    ).lean();
    if (!doc || Array.isArray(doc)) {
      throw new Error("Billing account upsert did not return a document");
    }
    return toBillingAccount(doc);
  }
}

export class MongoBillingEventRepository implements BillingEventRepository {
  async create(input: Omit<BillingEvent, "id" | "createdAt">): Promise<BillingEvent> {
    return toBillingEvent(await BillingEventModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<BillingEvent[]> {
    const docs = await BillingEventModel.find({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return docs.map(toBillingEvent);
  }
}

export class MongoInvoiceRepository implements InvoiceRepository {
  async create(input: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    return toInvoice(await InvoiceModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<Invoice[]> {
    const docs = await InvoiceModel.find({ organizationId: objectId(organizationId) }).sort({ issuedAt: -1 }).lean();
    return docs.map(toInvoice);
  }
}

export class MongoPaymentRepository implements PaymentRepository {
  async create(input: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    return toPayment(await PaymentModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<Payment[]> {
    const docs = await PaymentModel.find({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return docs.map(toPayment);
  }
}

export class MongoApiKeyRepository implements ApiKeyRepository {
  async create(input: Omit<ApiKey, "id" | "createdAt" | "updatedAt">): Promise<ApiKey> {
    return toApiKey(await ApiKeyModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<ApiKey[]> {
    const docs = await ApiKeyModel.find({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return docs.map(toApiKey);
  }

  async revoke(id: string, organizationId: string, revokedAt: Date): Promise<ApiKey | null> {
    const doc = await ApiKeyModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectId(organizationId) },
      { $set: { revokedAt } },
      { new: true },
    ).lean();
    return doc ? toApiKey(doc) : null;
  }

  async touchLastUsed(keyPrefix: string, usedAt: Date): Promise<ApiKey | null> {
    const doc = await ApiKeyModel.findOneAndUpdate({ keyPrefix, revokedAt: null }, { $set: { lastUsedAt: usedAt } }, { new: true }).lean();
    return doc ? toApiKey(doc) : null;
  }
}

export class MongoAuditLogRepository implements AuditLogRepository {
  async create(input: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    return toAuditLog(await AuditLogModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<AuditLog[]> {
    const docs = await AuditLogModel.find({ organizationId: objectId(organizationId) }).sort({ createdAt: -1 }).lean();
    return docs.map(toAuditLog);
  }
}

export class MongoFeatureFlagRepository implements FeatureFlagRepository {
  async listByOrganization(organizationId: string): Promise<FeatureFlag[]> {
    const docs = await FeatureFlagModel.find({ organizationId: objectId(organizationId) }).sort({ key: 1 }).lean();
    return docs.map(toFeatureFlag);
  }

  async upsert(
    organizationId: string,
    key: GovernanceFeatureFlagKey,
    input: Partial<Omit<FeatureFlag, "id" | "organizationId" | "key" | "createdAt" | "updatedAt">>,
  ): Promise<FeatureFlag> {
    const doc = await FeatureFlagModel.findOneAndUpdate(
      { organizationId: objectId(organizationId), key },
      { $set: input, $setOnInsert: { organizationId: objectId(organizationId), key } },
      { new: true, upsert: true },
    ).lean();
    if (!doc || Array.isArray(doc)) {
      throw new Error("Feature flag upsert did not return a document");
    }
    return toFeatureFlag(doc);
  }
}

export class MongoUsageRecordRepository implements UsageRecordRepository {
  async create(input: Omit<UsageRecord, "id" | "createdAt" | "updatedAt">): Promise<UsageRecord> {
    return toUsageRecord(await UsageRecordModel.create(input));
  }

  async listByOrganization(organizationId: string): Promise<UsageRecord[]> {
    const docs = await UsageRecordModel.find({ organizationId: objectId(organizationId) }).sort({ occurredAt: -1 }).lean();
    return docs.map(toUsageRecord);
  }

  async sumByMetric(organizationId: string): Promise<Record<UsageRecordMetric, number>> {
    const rows = await UsageRecordModel.aggregate<{ _id: UsageRecordMetric; total: number }>([
      { $match: { organizationId: objectId(organizationId) } },
      { $group: { _id: "$metric", total: { $sum: "$quantity" } } },
    ]);
    const totals: Record<UsageRecordMetric, number> = {
      calls: 0,
      messages: 0,
      ai_requests: 0,
      tokens: 0,
      storage_gb: 0,
      workflow_executions: 0,
      minutes: 0,
    };
    rows.forEach((row) => {
      totals[row._id] = row.total;
    });
    return totals;
  }
}

export async function seedDefaultFeatureFlags(organizationId: string): Promise<void> {
  const keys: GovernanceFeatureFlagKey[] = ["ai_calling", "whatsapp", "crm", "memory", "automation", "analytics", "rag", "optimization"];
  const operations: AnyBulkWriteOperation[] = keys.map((key) => ({
    updateOne: {
      filter: { organizationId: objectId(organizationId), key },
      update: {
        $setOnInsert: {
          organizationId: objectId(organizationId),
          key,
          enabled: key !== "whatsapp",
          rolloutPercentage: key === "whatsapp" ? 0 : 100,
          metadata: {},
        },
      },
      upsert: true,
    },
  }));
  if (operations.length) {
    await FeatureFlagModel.bulkWrite(operations);
  }
}

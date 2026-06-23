import type { Subscription } from "../../domain/entities/subscription.js";
import type { SubscriptionPlan, SubscriptionPlanTier } from "../../domain/entities/subscription-plan.js";
import type { AuditLogRepository, SubscriptionPlanRepository, SubscriptionRepository } from "../ports.js";

const DEFAULT_PLANS: Array<Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">> = [
  {
    organizationId: null,
    tier: "FREE",
    name: "Free",
    description: "Starter sandbox for low-volume teams.",
    monthlyPriceCents: 0,
    limits: { seats: 1, calls: 50, minutes: 250, messages: 250, aiRequests: 500, storageGb: 1, workflowExecutions: 50 },
    features: ["crm", "memory"],
    active: true,
  },
  {
    organizationId: null,
    tier: "STARTER",
    name: "Starter",
    description: "Production calling and automation for small teams.",
    monthlyPriceCents: 4900,
    limits: { seats: 5, calls: 500, minutes: 2500, messages: 2500, aiRequests: 10000, storageGb: 10, workflowExecutions: 1000 },
    features: ["ai_calling", "crm", "memory", "automation", "analytics"],
    active: true,
  },
  {
    organizationId: null,
    tier: "PRO",
    name: "Pro",
    description: "Advanced analytics, RAG, and optimization.",
    monthlyPriceCents: 14900,
    limits: { seats: 25, calls: 5000, minutes: 25000, messages: 25000, aiRequests: 100000, storageGb: 100, workflowExecutions: 10000 },
    features: ["ai_calling", "whatsapp", "crm", "memory", "automation", "analytics", "rag", "optimization"],
    active: true,
  },
  {
    organizationId: null,
    tier: "ENTERPRISE",
    name: "Enterprise",
    description: "Enterprise governance, limits, and support.",
    monthlyPriceCents: 49900,
    limits: { seats: 250, calls: 50000, minutes: 250000, messages: 250000, aiRequests: 1000000, storageGb: 1000, workflowExecutions: 100000 },
    features: ["ai_calling", "whatsapp", "crm", "memory", "automation", "analytics", "rag", "optimization"],
    active: true,
  },
];

export class SubscriptionService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly plans: SubscriptionPlanRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async plansList(organizationId?: string | null): Promise<SubscriptionPlan[]> {
    const existing = await this.plans.list(organizationId ?? null);
    if (existing.length) {
      return existing;
    }

    await Promise.all(DEFAULT_PLANS.map((plan) => this.plans.create(plan)));
    return this.plans.list(organizationId ?? null);
  }

  async list(organizationId: string): Promise<Subscription[]> {
    return this.subscriptions.listByOrganization(organizationId);
  }

  async ensureSubscription(organizationId: string, tier: SubscriptionPlanTier = "FREE"): Promise<Subscription> {
    const existing = await this.subscriptions.findByOrganization(organizationId);
    if (existing) {
      return existing;
    }

    const plan = (await this.plans.findByTier(tier)) ?? (await this.plansList()).find((candidate) => candidate.tier === tier);
    if (!plan) {
      throw new Error(`Subscription plan ${tier} is not available`);
    }

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const subscription = await this.subscriptions.create({
      organizationId,
      planId: plan.id,
      tier: plan.tier,
      status: plan.tier === "FREE" ? "ACTIVE" : "TRIALING",
      seats: plan.limits.seats,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      entitlements: { ...plan.limits },
      cancelAtPeriodEnd: false,
      metadata: {},
    });
    await this.auditLogs.create({
      organizationId,
      actorId: null,
      actorType: "SYSTEM",
      action: "subscription.created",
      resourceType: "subscription",
      resourceId: subscription.id,
      ipAddress: null,
      userAgent: null,
      metadata: { tier: subscription.tier },
    });
    return subscription;
  }
}

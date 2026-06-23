import type {
  ApiKeyRepository,
  BillingAccountRepository,
  OrganizationRepository,
  SubscriptionRepository,
  TenantAdminOverview,
  UsageRecordRepository,
} from "../ports.js";

export class TenantGovernanceService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly billingAccounts: BillingAccountRepository,
    private readonly apiKeys: ApiKeyRepository,
    private readonly usageRecords: UsageRecordRepository,
  ) {}

  async overview(organizationId?: string | null): Promise<TenantAdminOverview> {
    const organizations = await this.organizations.list();
    const scopedOrganizations = organizationId
      ? organizations.filter((organization) => organization.id === organizationId)
      : organizations;
    const subscriptionGroups = await Promise.all(
      scopedOrganizations.map((organization) => this.subscriptions.listByOrganization(organization.id)),
    );
    const billingAccounts = await Promise.all(
      scopedOrganizations.map((organization) => this.billingAccounts.findByOrganization(organization.id)),
    );
    const apiKeyGroups = await Promise.all(
      scopedOrganizations.map((organization) => this.apiKeys.listByOrganization(organization.id)),
    );
    const usageTotals = organizationId
      ? await this.usageRecords.sumByMetric(organizationId)
      : {
          calls: 0,
          messages: 0,
          ai_requests: 0,
          tokens: 0,
          storage_gb: 0,
          workflow_executions: 0,
          minutes: 0,
        };

    return {
      organizationCount: scopedOrganizations.length,
      activeOrganizationCount: scopedOrganizations.filter((organization) => organization.status === "ACTIVE").length,
      suspendedOrganizationCount: scopedOrganizations.filter((organization) => organization.status === "SUSPENDED").length,
      activeSubscriptionCount: subscriptionGroups.flat().filter((subscription) => subscription.status === "ACTIVE").length,
      monthlyRecurringRevenueCents: subscriptionGroups
        .flat()
        .filter((subscription) => subscription.status === "ACTIVE")
        .reduce((sum, subscription) => sum + ((subscription.metadata.monthlyPriceCents as number | undefined) ?? 0), 0),
      outstandingBalanceCents: billingAccounts.reduce((sum, account) => sum + (account?.balanceCents ?? 0), 0),
      apiKeyCount: apiKeyGroups.flat().length,
      auditLogCount: 0,
      usageTotals,
    };
  }
}

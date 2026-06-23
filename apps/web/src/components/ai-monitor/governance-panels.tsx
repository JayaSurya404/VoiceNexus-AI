"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ApiKeyDto,
  AuditLogDto,
  BillingOverviewDto,
  FeatureFlagDto,
  InvoiceDto,
  OrganizationDto,
  PaymentDto,
  SubscriptionDto,
  SubscriptionPlanDto,
  TenantAdminOverviewDto,
  UsageRecordDto,
} from "@/lib/api/ai-brain-api";

type GovernancePanelsProps = {
  adminOverview?: TenantAdminOverviewDto;
  apiKeys: ApiKeyDto[];
  auditLogs: AuditLogDto[];
  billing?: BillingOverviewDto;
  featureFlags: FeatureFlagDto[];
  invoices: InvoiceDto[];
  organizations: OrganizationDto[];
  payments: PaymentDto[];
  plans: SubscriptionPlanDto[];
  subscriptions: SubscriptionDto[];
  usage: UsageRecordDto[];
};

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { currency, style: "currency" }).format(cents / 100);

const number = (value: number) => value.toLocaleString();

const badgeVariant = (value: string): "default" | "secondary" | "destructive" | "outline" => {
  if (["SUSPENDED", "PAST_DUE", "FAILED", "REVOKED", "UNCOLLECTIBLE"].includes(value)) {
    return "destructive";
  }

  if (["ACTIVE", "PAID", "SUCCEEDED"].includes(value)) {
    return "default";
  }

  if (["TRIAL", "TRIALING", "OPEN", "PENDING"].includes(value)) {
    return "secondary";
  }

  return "outline";
};

function MetricCard({ label, value, detail }: { detail: string; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

export function GovernancePanels({
  adminOverview,
  apiKeys,
  auditLogs,
  billing,
  featureFlags,
  invoices,
  organizations,
  payments,
  plans,
  subscriptions,
  usage,
}: GovernancePanelsProps) {
  const currentSubscription = subscriptions[0] ?? null;
  const currentPlan = currentSubscription
    ? plans.find((plan) => plan.id === currentSubscription.planId || plan.tier === currentSubscription.tier)
    : null;
  const usageTotals = usage.reduce<Record<string, number>>((totals, record) => {
    totals[record.metric] = (totals[record.metric] ?? 0) + record.quantity;
    return totals;
  }, {});

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Governance & Administration</h2>
        <p className="text-sm text-muted-foreground">
          Multi-tenant operations, subscription health, billing, feature access, API keys, and audit posture.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail="Tenants currently registered"
          label="Organizations"
          value={number(adminOverview?.organizationCount ?? organizations.length)}
        />
        <MetricCard
          detail="Active subscriptions"
          label="Subscription Status"
          value={number(adminOverview?.activeSubscriptionCount ?? subscriptions.length)}
        />
        <MetricCard
          detail="Current outstanding tenant balance"
          label="Billing Balance"
          value={money(adminOverview?.outstandingBalanceCents ?? billing?.balanceCents ?? 0)}
        />
        <MetricCard
          detail="Total tracked AI requests"
          label="Usage Metrics"
          value={number(adminOverview?.usageTotals.ai_requests ?? usageTotals.ai_requests ?? 0)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {organizations.length === 0 ? (
              <EmptyState label="No organizations are available." />
            ) : (
              organizations.slice(0, 6).map((organization) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={organization.id}>
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">{organization.slug}</p>
                  </div>
                  <Badge variant={badgeVariant(organization.status)}>{organization.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentSubscription ? (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentSubscription.tier}</p>
                    <p className="text-sm text-muted-foreground">{currentPlan?.name ?? "Current plan"}</p>
                  </div>
                  <Badge variant={badgeVariant(currentSubscription.status)}>{currentSubscription.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <span>{number(currentSubscription.seats)} seats</span>
                  <span>{number(currentSubscription.entitlements.calls ?? 0)} calls</span>
                  <span>{number(currentSubscription.entitlements.minutes ?? 0)} minutes</span>
                </div>
              </div>
            ) : (
              <EmptyState label="No subscription is active for this organization." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <MetricCard detail="Invoice total" label="Invoices" value={money(billing?.invoiceTotalCents ?? 0)} />
            <MetricCard detail="Payment total" label="Payments" value={money(billing?.paymentTotalCents ?? 0)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featureFlags.length === 0 ? (
              <EmptyState label="Feature flags have not been initialized." />
            ) : (
              featureFlags.map((flag) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={flag.id}>
                  <div>
                    <p className="font-medium">{flag.key}</p>
                    <p className="text-sm text-muted-foreground">{flag.rolloutPercentage}% rollout</p>
                  </div>
                  <Badge variant={flag.enabled ? "default" : "outline"}>{flag.enabled ? "ENABLED" : "DISABLED"}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiKeys.length === 0 ? (
              <EmptyState label="No API keys have been created." />
            ) : (
              apiKeys.slice(0, 6).map((apiKey) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={apiKey.id}>
                  <div>
                    <p className="font-medium">{apiKey.name}</p>
                    <p className="text-sm text-muted-foreground">{apiKey.keyPrefix}</p>
                  </div>
                  <Badge variant={apiKey.revokedAt ? "destructive" : "default"}>{apiKey.revokedAt ? "REVOKED" : apiKey.type}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 ? (
              <EmptyState label="No invoices are available." />
            ) : (
              invoices.slice(0, 6).map((invoice) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={invoice.id}>
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{money(invoice.totalCents, invoice.currency)}</p>
                  </div>
                  <Badge variant={badgeVariant(invoice.status)}>{invoice.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 ? (
              <EmptyState label="No payments have been recorded." />
            ) : (
              payments.slice(0, 6).map((payment) => (
                <div className="flex items-center justify-between rounded-md border p-3" key={payment.id}>
                  <div>
                    <p className="font-medium">{money(payment.amountCents, payment.currency)}</p>
                    <p className="text-sm text-muted-foreground">{payment.provider ?? "manual"}</p>
                  </div>
                  <Badge variant={badgeVariant(payment.status)}>{payment.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLogs.length === 0 ? (
              <EmptyState label="No audit logs have been recorded." />
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div className="rounded-md border p-3" key={log.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{log.action}</p>
                    <Badge variant="outline">{log.actorType}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.resourceType} {log.resourceId ?? ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

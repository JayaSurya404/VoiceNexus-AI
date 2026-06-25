"use client";

import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { MetricCard } from "@/components/analytics/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsOverview, useReportingDashboard, useRevenueAnalytics } from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";

export default function ExecutiveAnalyticsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const overview = useAnalyticsOverview(organizationId);
  const revenue = useRevenueAnalytics(organizationId);
  const dashboard = useReportingDashboard(organizationId);
  if (!organizationId) return <AnalyticsEmptyState title="No organization selected" description="Select an organization before viewing executive analytics." />;
  return <div className="space-y-6"><section className="grid gap-4 md:grid-cols-4"><MetricCard label="AI performance" loading={overview.isLoading} value={Math.round(overview.data?.aiPerformance ?? 0)} /><MetricCard label="Human performance" loading={overview.isLoading} value={Math.round(overview.data?.humanPerformance ?? 0)} /><MetricCard label="Pipeline value" loading={revenue.isLoading} value={revenue.data?.pipelineValue ?? 0} /><MetricCard label="Win rate" loading={revenue.isLoading} value={`${Math.round(revenue.data?.winRate ?? 0)}%`} /></section><Card><CardHeader><CardTitle>Executive Dashboard</CardTitle></CardHeader><CardContent><pre className="overflow-auto rounded-2xl bg-slate-50 p-4 text-sm">{JSON.stringify(dashboard.data ?? {}, null, 2)}</pre></CardContent></Card></div>;
}

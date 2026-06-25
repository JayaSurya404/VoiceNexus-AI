"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Building2, FileDown, LineChart, Radio, ReceiptText, Search, UsersRound } from "lucide-react";

import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { MetricCard } from "@/components/analytics/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsOverview, useConversionAnalytics, useRevenueAnalytics } from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { label: "Executive", href: "/analytics/executive", icon: BarChart3 },
  { label: "KPIs", href: "/analytics/kpis", icon: LineChart },
  { label: "Revenue", href: "/analytics/revenue", icon: ReceiptText },
  { label: "Calls", href: "/analytics/calls", icon: Radio },
  { label: "Conversations", href: "/analytics/conversations", icon: Brain },
  { label: "Customers", href: "/analytics/customers", icon: UsersRound },
  { label: "Organizations", href: "/analytics/organizations", icon: Building2 },
  { label: "Team", href: "/analytics/team", icon: UsersRound },
  { label: "Agents", href: "/analytics/agents", icon: UsersRound },
  { label: "AI", href: "/analytics/ai", icon: Brain },
  { label: "Runtime", href: "/analytics/runtime", icon: Radio },
  { label: "Queue", href: "/analytics/queue", icon: Radio },
  { label: "Memory", href: "/analytics/memory", icon: Brain },
  { label: "Knowledge", href: "/analytics/knowledge", icon: Brain },
  { label: "BI", href: "/analytics/bi", icon: BarChart3 },
  { label: "Sales", href: "/analytics/sales", icon: ReceiptText },
  { label: "Performance", href: "/analytics/performance", icon: LineChart },
  { label: "Forecast", href: "/analytics/forecast", icon: LineChart },
  { label: "Trends", href: "/analytics/trends", icon: LineChart },
  { label: "Live", href: "/analytics/live", icon: Radio },
  { label: "Reports", href: "/analytics/reports", icon: FileDown },
  { label: "Saved Reports", href: "/analytics/saved-reports", icon: FileDown },
  { label: "Templates", href: "/analytics/report-templates", icon: FileDown },
  { label: "Export", href: "/analytics/export", icon: FileDown },
  { label: "Search", href: "/analytics/search", icon: Search },
  { label: "Drill-downs", href: "/analytics/drilldowns", icon: Search },
];

export default function AnalyticsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const overview = useAnalyticsOverview(organizationId);
  const conversions = useConversionAnalytics(organizationId);
  const revenue = useRevenueAnalytics(organizationId);
  if (!organizationId) return <AnalyticsEmptyState title="No organization selected" description="Select an organization before viewing analytics." />;

  return <div className="space-y-8"><section className="rounded-3xl bg-slate-950 p-8 text-white"><p className="text-sm text-cyan-300">Analytics Platform</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Executive analytics workspace</h1><p className="mt-3 max-w-3xl text-slate-300">Track AI, calls, customers, team performance, revenue, live operations, reports, and exports.</p></section><section className="grid gap-4 md:grid-cols-4"><MetricCard label="AI performance" loading={overview.isLoading} value={Math.round(overview.data?.aiPerformance ?? 0)} /><MetricCard label="Lead conversion" loading={conversions.isLoading} value={`${Math.round(conversions.data?.overallConversionRate ?? 0)}%`} /><MetricCard label="Pipeline value" loading={revenue.isLoading} value={revenue.data?.pipelineValue ?? 0} /><MetricCard label="Workflow effectiveness" loading={overview.isLoading} value={Math.round(overview.data?.workflowEffectiveness ?? 0)} /></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{links.map((item) => <Card key={item.href}><CardHeader><item.icon className="h-5 w-5 text-cyan-600" /><CardTitle className="text-lg">{item.label}</CardTitle></CardHeader><CardContent><Button asChild className="w-full" variant="outline"><Link href={item.href}>Open <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>)}</section></div>;
}

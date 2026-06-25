"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";

import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { MetricCard } from "@/components/analytics/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useAgentPerformanceAnalytics,
  useAnalyticsOverview,
  useCallOutcomes,
  useConversationAnalytics,
  useConversationScorecards,
  useConversionAnalytics,
  useHumanAgents,
  useKnowledgeDocuments,
  useKnowledgeGaps,
  useKnowledgeImprovements,
  useKnowledgeSearches,
  useQualityScores,
  useQueueAnalytics,
  useQueueHealth,
  useReportingBenchmarks,
  useReportingDashboard,
  useReportingExports,
  useReportingGenerated,
  useReportingInsights,
  useReportingSummaries,
  useReportingTemplates,
  useReportingTrends,
  useRevenueAnalytics,
  useRevenueForecasts,
  useRevenueInsights,
  useRevenueOpportunities,
  useRevenueRisks,
  useRevenueWinLoss,
  useRuntimeMetrics,
  useRuntimeOrchestrationOverview,
  useRuntimeSessions,
  useSentimentAnalytics,
  useSupervisorOverview,
} from "@/hooks/use-ai-brain";
import { useAgentDashboard, useAgentPerformance, useAgents } from "@/hooks/use-agents";
import { useCalls } from "@/hooks/use-calls";
import { useContacts, useLeads } from "@/hooks/use-crm";
import { useCustomerMemories } from "@/hooks/use-memory";
import { useAuthStore } from "@/store/auth-store";

export type AnalyticsSection =
  | "revenue"
  | "conversations"
  | "customers"
  | "organizations"
  | "team"
  | "agents"
  | "ai"
  | "runtime"
  | "queue"
  | "memory"
  | "knowledge"
  | "bi"
  | "sales"
  | "performance"
  | "forecast"
  | "trends"
  | "live"
  | "reports"
  | "saved-reports"
  | "report-templates"
  | "export"
  | "search"
  | "drilldowns";

interface SectionConfig {
  title: string;
  eyebrow: string;
  description: string;
}

const sections: Record<AnalyticsSection, SectionConfig> = {
  revenue: {
    title: "Revenue Dashboard",
    eyebrow: "Revenue analytics",
    description: "Pipeline, weighted revenue, deal risk, opportunities, win/loss, upsell, and cross-sell performance.",
  },
  conversations: {
    title: "Conversation Analytics",
    eyebrow: "Conversation intelligence",
    description: "Quality, sentiment, outcomes, scorecards, and conversation drill-downs across AI and human-assisted sessions.",
  },
  customers: {
    title: "Customer Analytics",
    eyebrow: "Customer intelligence",
    description: "Lead, contact, memory, preference, and relationship health across the customer lifecycle.",
  },
  organizations: {
    title: "Organization Analytics",
    eyebrow: "Tenant health",
    description: "Organization-wide operating analytics combining CRM, calls, revenue, runtime, and AI performance.",
  },
  team: {
    title: "Team Analytics",
    eyebrow: "Human operations",
    description: "Human agent capacity, supervisor load, team availability, queue coverage, and takeover health.",
  },
  agents: {
    title: "Agent Analytics",
    eyebrow: "Agent performance",
    description: "AI and workspace agent throughput, quality, conversions, availability, skills, and runtime readiness.",
  },
  ai: {
    title: "AI Analytics",
    eyebrow: "AI quality",
    description: "AI performance, confidence, qualification accuracy, workflow effectiveness, and recommendation quality.",
  },
  runtime: {
    title: "Runtime Analytics",
    eyebrow: "Runtime sessions",
    description: "Runtime session volume, completion, handoffs, confidence, provider orchestration, and live session state.",
  },
  queue: {
    title: "Queue Analytics",
    eyebrow: "Queue operations",
    description: "Wait time, abandonment, transfers, escalation, resolution, and active queue health.",
  },
  memory: {
    title: "Memory Analytics",
    eyebrow: "Customer memory",
    description: "Relationship score, retained context, preferences, customer memories, and conversation memory coverage.",
  },
  knowledge: {
    title: "Knowledge Analytics",
    eyebrow: "Knowledge operations",
    description: "Knowledge documents, searches, retrieval quality, open gaps, learning events, and improvement trends.",
  },
  bi: {
    title: "Business Intelligence Dashboard",
    eyebrow: "Business intelligence",
    description: "Executive KPIs, benchmarks, trends, insights, and operating comparisons in one BI workspace.",
  },
  sales: {
    title: "Sales Dashboard",
    eyebrow: "Sales performance",
    description: "Revenue, opportunity health, conversions, win/loss, risks, and sales insights.",
  },
  performance: {
    title: "Performance Dashboard",
    eyebrow: "Performance",
    description: "AI, agent, queue, workflow, runtime, and customer performance views with leaderboards.",
  },
  forecast: {
    title: "Forecast Dashboard",
    eyebrow: "Forecast",
    description: "Projected revenue, committed revenue, pipeline confidence, and forecast-period comparisons.",
  },
  trends: {
    title: "Trend Dashboard",
    eyebrow: "Trends",
    description: "Time-based analytics for revenue, conversations, quality, knowledge, runtime, and queues.",
  },
  live: {
    title: "Live Monitoring Dashboard",
    eyebrow: "Live operations",
    description: "Active calls, runtime sessions, queue health, supervisor state, and operational exceptions.",
  },
  reports: {
    title: "Reports",
    eyebrow: "Reporting",
    description: "Generated reports, executive summaries, templates, report exports, and reusable reporting views.",
  },
  "saved-reports": {
    title: "Saved Reports",
    eyebrow: "Saved views",
    description: "Previously generated reports and summaries with export-ready drill-down data.",
  },
  "report-templates": {
    title: "Report Templates",
    eyebrow: "Templates",
    description: "Reusable report templates for executive, revenue, calls, customer, and AI performance packages.",
  },
  export: {
    title: "Report Export",
    eyebrow: "Exports",
    description: "CSV, Excel-compatible CSV, PDF-ready print views, and report export history.",
  },
  search: {
    title: "Advanced Search",
    eyebrow: "Search",
    description: "Search across conversations, customers, calls, reports, knowledge, revenue records, and agents.",
  },
  drilldowns: {
    title: "Drill-down Pages",
    eyebrow: "Deep analysis",
    description: "Detailed tables, comparisons, timelines, heatmaps, and leaderboards for every analytics domain.",
  },
};

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return value.toString();
  if (typeof value === "symbol") return value.description ?? "symbol";
  if (typeof value === "object") return JSON.stringify(value);
  return "-";
}

function currency(value: unknown) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numberValue(value));
}

function asRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function downloadFile(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]) {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 12);
  const escape = (value: unknown) => `"${stringValue(value).replaceAll('"', '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
}

function DataTable({
  rows,
  columns,
  empty,
}: Readonly<{
  rows: Record<string, unknown>[];
  columns: string[];
  empty: string;
}>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row, index) => (
            <TableRow key={stringValue(row.id ?? index)}>
              {columns.map((column) => (
                <TableCell className="max-w-72 truncate" key={column}>
                  {stringValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className="text-muted-foreground" colSpan={columns.length}>
              {empty}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function Bars({ values }: Readonly<{ values: Array<{ label: string; value: number }> }>) {
  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {values.map((item) => (
        <div className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-sm" key={item.label}>
          <span className="truncate text-muted-foreground">{item.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-600" style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }} />
          </div>
          <span className="text-right font-medium">{Math.round(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ rows }: Readonly<{ rows: Record<string, unknown>[] }>) {
  const cells = rows.slice(0, 24);

  return (
    <div className="grid grid-cols-6 gap-2">
      {cells.map((row, index) => {
        const value = numberValue(row.qualityScore ?? row.overallScore ?? row.aiConfidence ?? row.value ?? row.confidence);
        const opacity = Math.min(Math.max(value / 100, 0.18), 1);

        return (
          <div
            className="flex aspect-square items-center justify-center rounded-lg border text-xs font-medium text-slate-950"
            key={stringValue(row.id ?? index)}
            style={{ backgroundColor: `rgba(8, 145, 178, ${opacity})` }}
            title={stringValue(row.id ?? index)}
          >
            {Math.round(value)}
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsSectionPage({ section }: Readonly<{ section: AnalyticsSection }>) {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const [search, setSearch] = useState("");
  const org = organizationId ?? "";

  const overview = useAnalyticsOverview(organizationId);
  const conversions = useConversionAnalytics(organizationId);
  const conversations = useConversationAnalytics(organizationId);
  const outcomes = useCallOutcomes(organizationId);
  const sentiment = useSentimentAnalytics(organizationId);
  const quality = useQualityScores(organizationId);
  const agentAnalytics = useAgentPerformanceAnalytics(organizationId);
  const queueAnalytics = useQueueAnalytics(organizationId);
  const revenue = useRevenueAnalytics(organizationId);
  const forecasts = useRevenueForecasts(organizationId);
  const risks = useRevenueRisks(organizationId);
  const opportunities = useRevenueOpportunities(organizationId);
  const winLoss = useRevenueWinLoss(organizationId);
  const revenueInsights = useRevenueInsights(organizationId);
  const reports = useReportingGenerated(organizationId);
  const templates = useReportingTemplates(organizationId);
  const exports = useReportingExports(organizationId);
  const trends = useReportingTrends(organizationId);
  const benchmarks = useReportingBenchmarks(organizationId);
  const insights = useReportingInsights(organizationId);
  const summaries = useReportingSummaries(organizationId);
  const dashboard = useReportingDashboard(organizationId);
  const runtime = useRuntimeMetrics(organizationId);
  useRuntimeOrchestrationOverview(org);
  const runtimeSessions = useRuntimeSessions(org);
  const queues = useQueueHealth(organizationId);
  const humanAgents = useHumanAgents(organizationId);
  const supervisor = useSupervisorOverview(organizationId);
  const agentDashboard = useAgentDashboard(organizationId);
  const agents = useAgents({ organizationId: org }, Boolean(organizationId));
  const workspaceAgentPerformance = useAgentPerformance(organizationId);
  const leads = useLeads({ organizationId: org }, Boolean(organizationId));
  const contacts = useContacts({ organizationId: org }, Boolean(organizationId));
  const calls = useCalls({ organizationId: org }, Boolean(organizationId));
  const memories = useCustomerMemories({ organizationId: org }, Boolean(organizationId));
  const knowledgeDocuments = useKnowledgeDocuments(organizationId);
  const knowledgeSearches = useKnowledgeSearches(organizationId);
  const knowledgeGaps = useKnowledgeGaps(organizationId);
  const knowledgeImprovements = useKnowledgeImprovements(organizationId);
  const scorecards = useConversationScorecards(organizationId);

  const config = sections[section];
  const rows = useMemo(() => {
    const bySection: Record<AnalyticsSection, Record<string, unknown>[]> = {
      revenue: [...asRows(opportunities.data), ...asRows(risks.data), ...asRows(revenueInsights.data)],
      conversations: [...asRows(conversations.data), ...asRows(scorecards.data), ...asRows(sentiment.data)],
      customers: [...asRows(leads.data), ...asRows(contacts.data), ...asRows(memories.data)],
      organizations: [dashboard.data as unknown as Record<string, unknown>].filter(Boolean),
      team: [...asRows(humanAgents.data), ...asRows(queues.data)],
      agents: [...asRows(agents.data), ...asRows(agentAnalytics.data), ...asRows(workspaceAgentPerformance.data)],
      ai: [...asRows(conversations.data), ...asRows(quality.data), ...asRows(scorecards.data)],
      runtime: [...asRows(runtimeSessions.data), runtime.data as unknown as Record<string, unknown>].filter(Boolean),
      queue: [...asRows(queueAnalytics.data), ...asRows(queues.data)],
      memory: asRows(memories.data),
      knowledge: [...asRows(knowledgeDocuments.data), ...asRows(knowledgeSearches.data), ...asRows(knowledgeGaps.data)],
      bi: [...asRows(trends.data), ...asRows(benchmarks.data), ...asRows(insights.data)],
      sales: [...asRows(opportunities.data), ...asRows(winLoss.data), ...asRows(revenueInsights.data)],
      performance: [...asRows(agentAnalytics.data), ...asRows(queueAnalytics.data), ...asRows(quality.data)],
      forecast: asRows(forecasts.data),
      trends: [...asRows(trends.data), ...asRows(knowledgeImprovements.data)],
      live: [...asRows(calls.data), ...asRows(runtimeSessions.data), ...asRows(queues.data)],
      reports: [...asRows(reports.data), ...asRows(summaries.data)],
      "saved-reports": asRows(reports.data),
      "report-templates": asRows(templates.data),
      export: asRows(exports.data),
      search: [
        ...asRows(conversations.data),
        ...asRows(leads.data),
        ...asRows(calls.data),
        ...asRows(knowledgeDocuments.data),
        ...asRows(opportunities.data),
      ],
      drilldowns: [
        ...asRows(conversations.data),
        ...asRows(outcomes.data),
        ...asRows(agentAnalytics.data),
        ...asRows(queueAnalytics.data),
        ...asRows(forecasts.data),
      ],
    };

    const sourceRows = bySection[section];
    if (!search.trim()) return sourceRows;
    const term = search.trim().toLowerCase();
    return sourceRows.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
  }, [
    agentAnalytics.data,
    agents.data,
    benchmarks.data,
    calls.data,
    contacts.data,
    conversations.data,
    dashboard.data,
    exports.data,
    forecasts.data,
    humanAgents.data,
    insights.data,
    knowledgeDocuments.data,
    knowledgeGaps.data,
    knowledgeImprovements.data,
    knowledgeSearches.data,
    leads.data,
    memories.data,
    opportunities.data,
    outcomes.data,
    quality.data,
    queueAnalytics.data,
    queues.data,
    reports.data,
    revenueInsights.data,
    runtime.data,
    runtimeSessions.data,
    scorecards.data,
    search,
    section,
    sentiment.data,
    summaries.data,
    templates.data,
    trends.data,
    winLoss.data,
    workspaceAgentPerformance.data,
  ]);

  const tableColumns = useMemo(() => {
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter((key) => key !== "metadata");
    return (keys.length ? keys : ["id", "name", "status"]).slice(0, 6);
  }, [rows]);

  if (!organizationId) {
    return <AnalyticsEmptyState title="No organization selected" description="Select an organization before viewing analytics." />;
  }

  const csv = toCsv(rows);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-cyan-300">{config.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{config.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">{config.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="AI performance" loading={overview.isLoading} value={Math.round(overview.data?.aiPerformance ?? 0)} />
        <MetricCard label="Revenue" loading={revenue.isLoading} value={currency(revenue.data?.projectedRevenue)} />
        <MetricCard label="Rows in view" loading={false} value={rows.length} />
        <MetricCard label="Conversion" loading={conversions.isLoading} value={`${Math.round(conversions.data?.overallConversionRate ?? 0)}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Advanced Search and Drill-down</CardTitle>
              <div className="relative md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder="Search analytics records" value={search} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={tableColumns} empty="No analytics records match the current filters." rows={rows.slice(0, 25)} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparison View</CardTitle>
            </CardHeader>
            <CardContent>
              <Bars
                values={[
                  { label: "AI", value: numberValue(overview.data?.aiPerformance) },
                  { label: "Human", value: numberValue(overview.data?.humanPerformance) },
                  { label: "Queue", value: numberValue(overview.data?.queuePerformance) },
                  { label: "Workflow", value: numberValue(overview.data?.workflowEffectiveness) },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap rows={rows} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Timeline View</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.slice(0, 6).map((row, index) => (
              <div className="border-l-2 border-cyan-600 pl-3" key={stringValue(row.id ?? index)}>
                <p className="text-sm font-medium">{stringValue(row.title ?? row.name ?? row.outcome ?? row.status ?? `Record ${index + 1}`)}</p>
                <p className="text-xs text-muted-foreground">{stringValue(row.createdAt ?? row.updatedAt ?? row.computedAt ?? row.occurredAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows
              .map((row) => ({
                label: stringValue(row.name ?? row.agentId ?? row.queueName ?? row.title ?? row.id),
                value: numberValue(row.averageQaScore ?? row.qualityScore ?? row.overallScore ?? row.value ?? row.confidence),
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map((item, index) => (
                <div className="flex items-center justify-between text-sm" key={`${item.label}-${index}`}>
                  <span>{item.label}</span>
                  <span className="font-medium">{Math.round(item.value)}</span>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exports</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button onClick={() => downloadFile(`${section}-analytics.csv`, "text/csv;charset=utf-8", csv)} variant="outline">
              <Download className="h-4 w-4" /> CSV Export
            </Button>
            <Button onClick={() => downloadFile(`${section}-analytics-excel.csv`, "text/csv;charset=utf-8", csv)} variant="outline">
              <FileSpreadsheet className="h-4 w-4" /> Excel Export
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              <FileText className="h-4 w-4" /> PDF Export
            </Button>
            <Button asChild variant="outline">
              <Link href="/analytics/reports">Open Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pipeline value" loading={revenue.isLoading} value={currency(revenue.data?.pipelineValue)} />
        <MetricCard label="Forecasts" loading={forecasts.isLoading} value={forecasts.data?.length ?? 0} />
        <MetricCard label="Open risks" loading={risks.isLoading} value={(risks.data ?? []).filter((risk) => risk.active).length} />
        <MetricCard label="Calls" loading={calls.isLoading} value={calls.data?.length ?? 0} />
        <MetricCard label="Agents" loading={agentDashboard.isLoading} value={agentDashboard.data?.totalAgents ?? agents.data?.length ?? 0} />
        <MetricCard label="Supervisor sessions" loading={supervisor.isLoading} value={numberValue(supervisor.data?.activeAiSessions)} />
      </section>
    </div>
  );
}

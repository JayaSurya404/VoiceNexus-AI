import type {
  BenchmarkMetricDto,
  BusinessInsightDto,
  ExecutiveDashboardDto,
  ExecutiveSummaryDto,
  GeneratedReportDto,
  KpiMetricDto,
  ReportExportDto,
  ReportTemplateDto,
  TrendAnalysisDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportingIntelligencePanel({
  benchmarks,
  dashboard,
  exports,
  generated,
  insights,
  kpis,
  summaries,
  templates,
  trends,
}: Readonly<{
  benchmarks: BenchmarkMetricDto[];
  dashboard: ExecutiveDashboardDto | undefined;
  exports: ReportExportDto[];
  generated: GeneratedReportDto[];
  insights: BusinessInsightDto[];
  kpis: KpiMetricDto[];
  summaries: ExecutiveSummaryDto[];
  templates: ReportTemplateDto[];
  trends: TrendAnalysisDto[];
}>) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="KPI metrics" value={kpis.length} />
        <Metric label="Trends" value={trends.length} />
        <Metric label="Insights" value={insights.length} />
        <Metric label="Exports" value={exports.length} />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Executive dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Revenue fields" value={countKeys(dashboard?.revenueOverview)} />
            <Row label="Sales fields" value={countKeys(dashboard?.salesOverview)} />
            <Row label="Coaching fields" value={countKeys(dashboard?.coachingOverview)} />
            <Row label="AI fields" value={countKeys(dashboard?.aiPerformanceOverview)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpis.slice(0, 6).map((kpi: KpiMetricDto) => (
              <div className="rounded-2xl border p-4" key={kpi.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{kpi.name}</p>
                  <Badge variant="outline">{kpi.category}</Badge>
                </div>
                <p className="mt-2 text-2xl font-semibold">{formatNumber(kpi.value)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.period} / {kpi.trend}</p>
              </div>
            ))}
            {!kpis.length ? <p className="text-sm text-muted-foreground">KPI metrics will appear after reporting refresh.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend charts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trends.slice(0, 5).map((trend: TrendAnalysisDto) => (
              <div className="rounded-2xl border p-4" key={trend.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{trend.metric}</p>
                  <Badge variant="outline">{trend.direction}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{trend.insight}</p>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round(trend.changePercent)}% change</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ListPanel
          empty="No benchmarks calculated yet."
          items={benchmarks.map((benchmark: BenchmarkMetricDto) => ({
            id: benchmark.id,
            title: benchmark.metric,
            badge: benchmark.comparison,
            body: `${formatNumber(benchmark.value)} vs benchmark ${formatNumber(benchmark.benchmarkValue)}`,
          }))}
          title="Benchmarks"
        />
        <ListPanel
          empty="No business insights generated yet."
          items={insights.map((insight: BusinessInsightDto) => ({
            id: insight.id,
            title: insight.title,
            badge: `${insight.impactScore}/100`,
            body: insight.message,
          }))}
          title="Business insights"
        />
        <ListPanel
          empty="No executive summaries generated yet."
          items={summaries.map((summary: ExecutiveSummaryDto) => ({
            id: summary.id,
            title: summary.title,
            badge: `${summary.highlights.length} highlights`,
            body: summary.summary,
          }))}
          title="Executive summaries"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ListPanel
          empty="No generated reports yet."
          items={generated.map((report: GeneratedReportDto) => ({
            id: report.id,
            title: report.title,
            badge: report.status,
            body: report.summary,
          }))}
          title="Generated reports"
        />
        <ListPanel
          empty="No report templates configured."
          items={templates.map((template: ReportTemplateDto) => ({
            id: template.id,
            title: template.name,
            badge: template.type,
            body: `${template.sections.length} sections`,
          }))}
          title="Report templates"
        />
        <ListPanel
          empty="No export history available."
          items={exports.map((exportItem: ReportExportDto) => ({
            id: exportItem.id,
            title: exportItem.fileName,
            badge: exportItem.format,
            body: exportItem.status,
          }))}
          title="Export history"
        />
      </div>
    </div>
  );
}

function ListPanel({
  empty,
  items,
  title,
}: Readonly<{
  empty: string;
  items: Array<{ id: string; title: string; badge: string; body: string }>;
  title: string;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 6).map((item) => (
          <div className="rounded-2xl border p-4" key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{item.title}</p>
              <Badge variant="outline">{item.badge}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function countKeys(value: Record<string, unknown> | undefined): string {
  return String(Object.keys(value ?? {}).length);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

import type {
  CrossSellOpportunityDto,
  DealRiskDto,
  OpportunityDto,
  RevenueAnalyticsSummaryDto,
  RevenueForecastDto,
  SalesInsightDto,
  UpsellOpportunityDto,
  WinLossAnalysisDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueIntelligencePanel({
  crossSell,
  forecasts,
  insights,
  opportunities,
  overview,
  risks,
  upsell,
  winLoss,
}: Readonly<{
  crossSell: CrossSellOpportunityDto[];
  forecasts: RevenueForecastDto[];
  insights: SalesInsightDto[];
  opportunities: OpportunityDto[];
  overview: RevenueAnalyticsSummaryDto | undefined;
  risks: DealRiskDto[];
  upsell: UpsellOpportunityDto[];
  winLoss: WinLossAnalysisDto[];
}>) {
  const open = opportunities.filter((opportunity: OpportunityDto) => opportunity.status === "OPEN").length;
  const won = opportunities.filter((opportunity: OpportunityDto) => opportunity.status === "WON").length;
  const lost = opportunities.filter((opportunity: OpportunityDto) => opportunity.status === "LOST").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Pipeline value" value={money(overview?.pipelineValue ?? 0)} />
        <Metric label="Weighted revenue" value={money(overview?.weightedRevenue ?? 0)} />
        <Metric label="Projected revenue" value={money(overview?.projectedRevenue ?? 0)} />
        <Metric label="Win rate" value={`${Math.round((overview?.winRate ?? 0) * 100)}%`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Committed" value={money(overview?.committedRevenue ?? 0)} />
            <Row label="Won revenue" value={money(overview?.wonRevenue ?? 0)} />
            <Row label="Lost revenue" value={money(overview?.lostRevenue ?? 0)} />
            <Row label="Average deal" value={money(overview?.averageDealSize ?? 0)} />
            <Row label="Top source" value={overview?.topLeadSource ?? "None"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecasts.slice(0, 3).map((forecast: RevenueForecastDto) => (
              <div className="rounded-2xl border p-4" key={forecast.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{forecast.period}</p>
                  <Badge variant="outline">{Math.round(forecast.confidence * 100)}%</Badge>
                </div>
                <p className="mt-2 text-2xl font-semibold">{money(forecast.projectedRevenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{forecast.opportunityCount} opportunities</p>
              </div>
            ))}
            {!forecasts.length ? <p className="text-sm text-muted-foreground">Forecasts will appear after opportunities are available.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Open" value={open.toString()} />
            <Row label="Won" value={won.toString()} />
            <Row label="Lost" value={lost.toString()} />
            <Row label="Risk value" value={money(overview?.riskValue ?? 0)} />
            <Row label="Expansion value" value={money((overview?.upsellValue ?? 0) + (overview?.crossSellValue ?? 0))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.slice(0, 6).map((opportunity: OpportunityDto) => (
              <div className="rounded-2xl border p-4" key={opportunity.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{opportunity.name}</p>
                  <Badge variant={opportunity.status === "WON" ? "default" : "outline"}>{opportunity.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {opportunity.stageName} / {money(opportunity.value)} / {Math.round(opportunity.probability * 100)}%
                </p>
              </div>
            ))}
            {!opportunities.length ? <p className="text-sm text-muted-foreground">No opportunities tracked yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {risks.slice(0, 6).map((risk: DealRiskDto) => (
              <div className="rounded-2xl border p-4" key={risk.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{risk.riskType.replaceAll("_", " ")}</p>
                  <Badge variant={risk.riskScore >= 75 ? "destructive" : "outline"}>{risk.riskScore}/100</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{risk.reasons[0] ?? "Risk detected"}</p>
              </div>
            ))}
            {!risks.length ? <p className="text-sm text-muted-foreground">No active deal risks detected.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Win/loss dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {winLoss.slice(0, 5).map((analysis: WinLossAnalysisDto) => (
              <div className="rounded-2xl border p-4" key={analysis.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Deal {analysis.opportunityId.slice(-8)}</p>
                  <Badge variant={analysis.outcome === "WIN" ? "default" : "outline"}>{analysis.outcome}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{analysis.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 5).map((insight: SalesInsightDto) => (
              <div className="rounded-2xl border p-4" key={insight.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{insight.title}</p>
                  <Badge variant="outline">{insight.trend}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top revenue drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Lead source" value={overview?.topLeadSource ?? "None"} />
            <Row label="Owner" value={overview?.topOwnerId ?? "None"} />
            <Row label="Upsell value" value={money(overview?.upsellValue ?? 0)} />
            <Row label="Cross-sell value" value={money(overview?.crossSellValue ?? 0)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExpansionPanel items={upsell} title="Upsell opportunities" valueKey="fitScore" />
        <ExpansionPanel items={crossSell} title="Cross-sell opportunities" valueKey="affinityScore" />
      </div>
    </div>
  );
}

function ExpansionPanel({
  items,
  title,
  valueKey,
}: Readonly<{
  items: Array<UpsellOpportunityDto | CrossSellOpportunityDto>;
  title: string;
  valueKey: "fitScore" | "affinityScore";
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 6).map((item: UpsellOpportunityDto | CrossSellOpportunityDto) => {
          const score = valueKey === "fitScore" && "fitScore" in item ? item.fitScore : "affinityScore" in item ? item.affinityScore : 0;
          return (
            <div className="rounded-2xl border p-4" key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.product}</p>
                <Badge variant="outline">{score}/100</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{money(item.estimatedValue)}</p>
            </div>
          );
        })}
        {!items.length ? <p className="text-sm text-muted-foreground">No opportunities identified yet.</p> : null}
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

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

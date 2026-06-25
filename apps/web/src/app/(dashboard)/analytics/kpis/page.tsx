"use client";

import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReportingKpis } from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";

export default function KpiAnalyticsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const kpis = useReportingKpis(organizationId);
  if (!organizationId) return <AnalyticsEmptyState title="No organization selected" description="Select an organization before viewing KPI analytics." />;
  return <Card><CardHeader><CardTitle>KPI Dashboard</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Value</TableHead><TableHead>Target</TableHead><TableHead>Trend</TableHead><TableHead>Period</TableHead></TableRow></TableHeader><TableBody>{(kpis.data ?? []).map((kpi) => <TableRow key={kpi.id}><TableCell>{kpi.name}</TableCell><TableCell>{kpi.value} {kpi.unit}</TableCell><TableCell>{kpi.target ?? "-"}</TableCell><TableCell>{kpi.trend}</TableCell><TableCell>{kpi.period}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>;
}

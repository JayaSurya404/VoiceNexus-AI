"use client";

import Link from "next/link";

import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { MetricCard } from "@/components/analytics/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallOutcomes, useQualityScores } from "@/hooks/use-ai-brain";
import { useAuthStore } from "@/store/auth-store";

export default function CallAnalyticsPage() {
  const organizationId = useAuthStore((state) => state.activeOrganizationId);
  const outcomes = useCallOutcomes(organizationId);
  const quality = useQualityScores(organizationId);
  if (!organizationId) return <AnalyticsEmptyState title="No organization selected" description="Select an organization before viewing call analytics." />;
  return <div className="space-y-6"><section className="grid gap-4 md:grid-cols-3"><MetricCard label="Call outcomes" loading={outcomes.isLoading} value={outcomes.data?.length ?? 0} /><MetricCard label="Quality scores" loading={quality.isLoading} value={quality.data?.length ?? 0} /><MetricCard label="Avg quality" loading={quality.isLoading} value={Math.round((quality.data ?? []).reduce((sum, item) => sum + item.overallScore, 0) / Math.max(quality.data?.length ?? 0, 1))} /></section><Card><CardHeader><CardTitle>Call drill-down</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Outcome</TableHead><TableHead>Confidence</TableHead><TableHead>Call</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader><TableBody>{(outcomes.data ?? []).map((outcome) => <TableRow key={outcome.id}><TableCell>{outcome.outcome}</TableCell><TableCell>{Math.round(outcome.confidence * 100)}%</TableCell><TableCell>{outcome.callId ? <Link className="underline" href={`/calls/${outcome.callId}`}>{outcome.callId.slice(-8)}</Link> : "-"}</TableCell><TableCell>{outcome.reasoning}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}

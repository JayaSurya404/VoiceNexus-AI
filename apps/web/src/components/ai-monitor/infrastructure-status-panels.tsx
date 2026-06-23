"use client";

import type {
  EnvironmentReadinessDto,
  InfrastructureStatusDto,
  ProviderStatusDto
} from "@/lib/api/ai-brain-api";

interface InfrastructureStatusPanelsProps {
  status?: InfrastructureStatusDto;
  providers?: ProviderStatusDto[];
  environment?: EnvironmentReadinessDto;
}

function StatusPill({ ready }: { ready: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        ready ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {ready ? "Ready" : "Needs attention"}
    </span>
  );
}

function MetricRow({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{value}</p>
      </div>
      <StatusPill ready={ready} />
    </div>
  );
}

export function InfrastructureStatusPanels({
  status,
  providers,
  environment
}: InfrastructureStatusPanelsProps) {
  const providerStatuses = providers ?? status?.providers ?? [];
  const readiness = environment ?? {
    ready: status?.environment.ready ?? false,
    score: status?.environment.ready ? 100 : 0,
    environment: status?.environment.name ?? "unknown",
    production: status?.environment.production ?? false,
    issues: status?.environment.issues ?? []
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Infrastructure Integration</h2>
        <p className="text-sm text-slate-500">Provider, Redis, Mongo, Twilio, and environment readiness.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Provider Status</h3>
            <span className="text-xs text-slate-500">{providerStatuses.length} providers</span>
          </div>
          <div className="space-y-2">
            {providerStatuses.map((provider) => (
              <MetricRow
                key={provider.provider}
                label={`${provider.provider} (${provider.defaultModel})`}
                ready={provider.ready}
                value={provider.message ?? "Chat completion provider configured"}
              />
            ))}
            {providerStatuses.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
                No provider status available.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Infrastructure Status</h3>
            <StatusPill ready={Boolean(status?.redis.ready && status?.mongo.ready && status?.twilio.ready)} />
          </div>
          <div className="space-y-2">
            <MetricRow
              label="Redis"
              ready={status?.redis.ready ?? false}
              value={status?.redis.message ?? (status?.redis.configured ? "Configured" : "Not configured")}
            />
            <MetricRow
              label="MongoDB"
              ready={status?.mongo.ready ?? false}
              value={status?.mongo.message ?? (status?.mongo.configured ? "Configured" : "Not configured")}
            />
            <MetricRow
              label="Twilio"
              ready={status?.twilio.ready ?? false}
              value={status?.twilio.message ?? (status?.twilio.configured ? "Configured" : "Not configured")}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Environment Readiness</h3>
            <StatusPill ready={readiness.ready} />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-3xl font-semibold text-slate-950">{readiness.score}%</p>
            <p className="text-sm text-slate-500">
              {readiness.environment} {readiness.production ? "production" : "development"} readiness
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {readiness.issues.slice(0, 4).map((issue) => (
              <div key={`${issue.key}-${issue.message}`} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">{issue.key}</p>
                <p className="text-xs text-slate-500">{issue.message}</p>
              </div>
            ))}
            {readiness.issues.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-500">
                No environment issues detected.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

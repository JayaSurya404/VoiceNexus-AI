"use client";

import type {
  CallRuntimeSessionDto,
  OrganizationProviderRuntimeConfigDto,
  RuntimeFallbackEventDto,
  RuntimeHealthSnapshotDto,
  RuntimeIncidentDto
} from "@/lib/api/ai-brain-api";

interface RuntimeOrchestrationPanelsProps {
  overview?: RuntimeHealthSnapshotDto;
  providerConfig?: OrganizationProviderRuntimeConfigDto;
  sessions?: CallRuntimeSessionDto[];
  fallbacks?: RuntimeFallbackEventDto[];
  incidents?: RuntimeIncidentDto[];
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
      {label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
      {label}
    </p>
  );
}

export function RuntimeOrchestrationPanels({
  overview,
  providerConfig,
  sessions = [],
  fallbacks = [],
  incidents = []
}: RuntimeOrchestrationPanelsProps) {
  const dependencies = overview?.dependencies;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Runtime Orchestration</h2>
        <p className="text-sm text-slate-500">End-to-end provider, call, session, fallback, and incident monitoring.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Active Provider</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{overview?.activeProvider ?? "None"}</p>
          <p className="mt-1 text-xs text-slate-500">
            Preferred {providerConfig?.preferredProvider ?? "openai"} / fallback {(providerConfig?.automaticFallback ?? true) ? "on" : "off"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Active Sessions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{overview?.activeSessions ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Live runtime sessions</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Fallback Events</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{fallbacks.length}</p>
          <p className="mt-1 text-xs text-slate-500">Provider recovery events</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Runtime Incidents</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{incidents.length}</p>
          <p className="mt-1 text-xs text-slate-500">Open and recent incidents</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Active Provider Dashboard</h3>
          <div className="space-y-2">
            {(overview?.providerStatuses ?? []).map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{provider.provider}</p>
                  <p className="text-xs text-slate-500">{provider.defaultModel}</p>
                </div>
                <StatusBadge label={provider.ready ? "Ready" : "Down"} active={provider.ready} />
              </div>
            ))}
            {(overview?.providerStatuses.length ?? 0) === 0 ? <EmptyState label="No provider status available." /> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Runtime Session Dashboard</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{session.conversationId}</p>
                  <StatusBadge label={session.status} active={session.status === "ACTIVE" || session.status === "HUMAN_ASSIGNED"} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {session.provider} / {session.model}
                </p>
              </div>
            ))}
            {sessions.length === 0 ? <EmptyState label="No runtime sessions yet." /> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Dependency Health</h3>
          <div className="space-y-2">
            <StatusBadge label="Providers" active={dependencies?.providersReady ?? false} />
            <StatusBadge label="Twilio" active={dependencies?.twilioReady ?? false} />
            <StatusBadge label="Redis" active={dependencies?.redisReady ?? false} />
            <StatusBadge label="Mongo" active={dependencies?.mongoReady ?? false} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Fallback Dashboard</h3>
          <div className="space-y-2">
            {fallbacks.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">
                  {event.fromProvider} to {event.toProvider}
                </p>
                <p className="text-xs text-slate-500">{event.reason}</p>
              </div>
            ))}
            {fallbacks.length === 0 ? <EmptyState label="No fallback events recorded." /> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Runtime Incident Dashboard</h3>
          <div className="space-y-2">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{incident.category}</p>
                  <StatusBadge label={incident.severity} active={incident.severity === "LOW" || incident.severity === "MEDIUM"} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{incident.message}</p>
              </div>
            ))}
            {incidents.length === 0 ? <EmptyState label="No runtime incidents recorded." /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

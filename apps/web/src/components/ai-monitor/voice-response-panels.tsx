import type { VoiceResponseDto, VoiceResponseMetricsDto } from "@/lib/api/voice-responses-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VoiceResponseMetricsPanel({ metrics }: Readonly<{ metrics: VoiceResponseMetricsDto | undefined }>) {
  const providerUsage = Object.entries(metrics?.providerUsage ?? {})
    .map(([provider, count]) => `${provider}: ${count}`)
    .join(" · ");

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric label="Voice responses" value={metrics?.responsesGenerated ?? 0} />
      <Metric label="Audio seconds" value={Math.round(metrics?.audioSecondsGenerated ?? 0)} />
      <Metric label="Avg latency" value={`${Math.round(metrics?.averageLatency ?? 0)}ms`} />
      <Metric label="Playback success" value={`${Math.round((metrics?.playbackSuccessRate ?? 0) * 100)}%`} />
      <Card className="md:col-span-4">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Provider usage: {providerUsage || "No provider usage yet"}
        </CardContent>
      </Card>
    </section>
  );
}

export function VoiceResponsesPanel({ responses }: Readonly<{ responses: VoiceResponseDto[] }>) {
  const queued = responses.filter((response) => response.status === "QUEUED" || response.status === "PLAYING");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Voice responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {responses.slice(0, 10).map((response) => (
            <div className="rounded-2xl border p-4" key={response.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{response.provider} · {response.voice}</p>
                <Badge variant={response.status === "FAILED" ? "destructive" : "outline"}>{response.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(response.durationMs / 1000)}s · {response.latencyMs ?? 0}ms latency · {new Date(response.createdAt).toLocaleString()}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{response.responseText}</p>
            </div>
          ))}
          {!responses.length ? <p className="text-sm text-muted-foreground">No generated voice responses yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audio queue & playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queued.map((response) => (
            <div className="rounded-2xl border p-4" key={response.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium">Call {response.callId.slice(-8)}</p>
                <Badge>{response.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{response.responseText}</p>
            </div>
          ))}
          {!queued.length ? <p className="text-sm text-muted-foreground">No queued or playing audio right now.</p> : null}
        </CardContent>
      </Card>
    </div>
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

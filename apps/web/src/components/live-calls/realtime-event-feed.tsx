import type { RealtimeEventEnvelopeDto } from "@voicenexus/contracts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RealtimeEventFeed({ events }: Readonly<{ events: RealtimeEventEnvelopeDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Realtime event feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Lifecycle, audio metadata, and transcript events will stream here.</p>
        ) : (
          events.map((event) => (
            <div className="rounded-2xl border p-4" key={event.id}>
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{event.topic}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(event.occurredAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-2 font-mono text-xs text-slate-600">{event.callSessionId ?? "organization"}</p>
              <pre className="mt-3 max-h-28 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

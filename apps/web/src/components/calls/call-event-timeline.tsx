import type { CallEventDto } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CallEventTimeline({ events }: Readonly<{ events: CallEventDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div className="border-l-2 border-slate-200 pl-4" key={event.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{event.type.replaceAll("_", " ")}</Badge>
              <p className="text-sm font-medium">{event.title}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {events.length === 0 ? <p className="text-sm text-muted-foreground">No call events recorded yet.</p> : null}
      </CardContent>
    </Card>
  );
}

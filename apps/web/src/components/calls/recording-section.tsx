import type { CallRecordingDto } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecordingSection({ recordings }: Readonly<{ recordings: CallRecordingDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recordings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.map((recording) => (
          <div className="rounded-2xl border p-4" key={recording.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={recording.status === "COMPLETED" ? "secondary" : "outline"}>{recording.status}</Badge>
              <span className="text-xs text-muted-foreground">
                {recording.durationSeconds === null ? "Duration pending" : `${recording.durationSeconds}s`}
              </span>
            </div>
            {recording.recordingUrl ? (
              <audio className="mt-4 w-full" controls src={recording.recordingUrl}>
                <track kind="captions" />
              </audio>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Recording URL is not available yet.</p>
            )}
          </div>
        ))}
        {recordings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Recordings appear here when Twilio sends recording callbacks.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

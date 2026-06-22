import type {
  BargeInEventDto,
  PlaybackSessionDto,
  RealtimeConversationDto,
  RealtimeRuntimeMetricsDto,
  TurnEventDto,
} from "@/lib/api/realtime-runtime-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RealtimeRuntimeMetricsPanel({ metrics }: Readonly<{ metrics: RealtimeRuntimeMetricsDto | undefined }>) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <RuntimeMetric label="Speech state calls" value={metrics?.activeConversations ?? 0} />
      <RuntimeMetric label="Takeovers" value={metrics?.takeoverActive ?? 0} />
      <RuntimeMetric label="Barge-ins" value={metrics?.bargeIns ?? 0} />
      <RuntimeMetric label="Total latency" value={`${Math.round(metrics?.totalLatency ?? 0)}ms`} />
      <RuntimeMetric label="STT latency" value={`${Math.round(metrics?.sttLatency ?? 0)}ms`} />
      <RuntimeMetric label="AI latency" value={`${Math.round(metrics?.aiLatency ?? 0)}ms`} />
      <RuntimeMetric label="TTS latency" value={`${Math.round(metrics?.ttsLatency ?? 0)}ms`} />
      <RuntimeMetric label="Playback latency" value={`${Math.round(metrics?.playbackLatency ?? 0)}ms`} />
    </section>
  );
}

export function RealtimeRuntimePanel({
  bargeIns,
  conversations,
  onRelease,
  onSelect,
  onTakeover,
  playback,
  selectedConversationId,
  turns,
}: Readonly<{
  bargeIns: BargeInEventDto[];
  conversations: RealtimeConversationDto[];
  onRelease: (conversationId: string) => void;
  onSelect: (conversationId: string) => void;
  onTakeover: (conversationId: string) => void;
  playback: PlaybackSessionDto[];
  selectedConversationId: string | null;
  turns: TurnEventDto[];
}>) {
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Live call runtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversations.map((conversation) => (
            <button
              className={`w-full rounded-2xl border p-4 text-left transition hover:border-slate-400 ${
                conversation.id === selectedConversationId ? "border-slate-900 bg-slate-50" : ""
              }`}
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              type="button"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Call {conversation.callSessionId.slice(-8)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {new Date(conversation.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{conversation.speechState}</Badge>
                  <Badge variant={conversation.takeoverActive ? "destructive" : "outline"}>
                    {conversation.takeoverActive ? "Human takeover" : conversation.status}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
          {!conversations.length ? (
            <p className="text-sm text-muted-foreground">No realtime conversations are active yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live agent controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedConversation ? (
            <>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Runtime status</p>
                <p className="mt-1 text-xl font-semibold">{selectedConversation.speechState}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedConversation.takeoverActive
                    ? "AI playback is disabled while the live agent owns the conversation."
                    : "AI runtime is allowed to respond through the existing voice pipeline."}
                </p>
              </div>
              <div className="flex gap-3">
                <Button disabled={selectedConversation.takeoverActive} onClick={() => onTakeover(selectedConversation.id)}>
                  Take Over
                </Button>
                <Button
                  disabled={!selectedConversation.takeoverActive}
                  onClick={() => onRelease(selectedConversation.id)}
                  variant="outline"
                >
                  Release
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a runtime conversation to control takeover.</p>
          )}
        </CardContent>
      </Card>

      <RuntimeTimeline turns={turns} bargeIns={bargeIns} playback={playback} />
    </div>
  );
}

function RuntimeTimeline({
  bargeIns,
  playback,
  turns,
}: Readonly<{ bargeIns: BargeInEventDto[]; playback: PlaybackSessionDto[]; turns: TurnEventDto[] }>) {
  const events = [
    ...turns.map((turn) => ({
      id: turn.id,
      badge: turn.type,
      detail: turn.transcript ?? `${turn.speaker} event`,
      time: turn.occurredAt,
    })),
    ...playback.map((session) => ({
      id: session.id,
      badge: `PLAYBACK_${session.status}`,
      detail: `${Math.round(session.durationMs / 1000)}s audio response`,
      time: session.startedAt ?? session.createdAt,
    })),
    ...bargeIns.map((bargeIn) => ({
      id: bargeIn.id,
      badge: "BARGE_IN_DETECTED",
      detail: bargeIn.transcriptFragment ?? bargeIn.reason,
      time: bargeIn.detectedAt,
    })),
  ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime());

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Runtime timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div className="rounded-2xl border p-4" key={event.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline">{event.badge}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(event.time).toLocaleTimeString()}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
          </div>
        ))}
        {!events.length ? (
          <p className="text-sm text-muted-foreground">Turn starts, playback events, cancellations, and barge-ins will appear here.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RuntimeMetric({ label, value }: Readonly<{ label: string; value: number | string }>) {
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

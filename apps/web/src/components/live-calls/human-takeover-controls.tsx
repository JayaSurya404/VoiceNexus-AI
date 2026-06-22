import type { ActiveCallSessionDto } from "@voicenexus/contracts";

import type { HumanAgentDto, HumanAgentSessionDto, LiveTakeoverDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HumanTakeoverControls({
  agents,
  calls,
  onJoin,
  onRelease,
  onTakeover,
  onWhisperAgent,
  onWhisperAi,
  sessions,
  takeovers,
}: Readonly<{
  agents: HumanAgentDto[];
  calls: ActiveCallSessionDto[];
  onJoin: (agentId: string, callId: string) => void;
  onRelease: (takeoverId: string) => void;
  onTakeover: (sessionId: string, agentId: string) => void;
  onWhisperAgent: (sessionId: string, agentId: string) => void;
  onWhisperAi: (sessionId: string, agentId: string) => void;
  sessions: HumanAgentSessionDto[];
  takeovers: LiveTakeoverDto[];
}>) {
  const agent = agents.find((item) => item.status === "AVAILABLE") ?? agents[0] ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Human agent console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {calls.map((call) => {
          const session = sessions.find((item) => item.callId === call.callSessionId);
          const takeover = session ? takeovers.find((item) => item.sessionId === session.id && item.status !== "ENDED") : null;
          return (
            <div className="rounded-2xl border p-4" key={call.callSessionId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Call {call.callSessionId.slice(-8)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned agent: {session?.agentId.slice(-8) ?? "Unassigned"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{session?.controller ?? "AI"}</Badge>
                  <Badge variant={takeover?.status === "ACTIVE" ? "destructive" : "outline"}>
                    {takeover?.status ?? "NO TAKEOVER"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={!agent || Boolean(session)} onClick={() => agent && onJoin(agent.id, call.callSessionId)} size="sm">
                  Join Call
                </Button>
                <Button disabled={!agent || !session} onClick={() => session && agent && onTakeover(session.id, agent.id)} size="sm">
                  Take Over
                </Button>
                <Button disabled={!takeover} onClick={() => takeover && onRelease(takeover.id)} size="sm" variant="outline">
                  Release Call
                </Button>
                <Button disabled={!agent || !session} onClick={() => session && agent && onWhisperAi(session.id, agent.id)} size="sm" variant="outline">
                  Whisper To AI
                </Button>
                <Button disabled={!agent || !session} onClick={() => session && agent && onWhisperAgent(session.id, agent.id)} size="sm" variant="outline">
                  Whisper To Agent
                </Button>
              </div>
            </div>
          );
        })}
        {!calls.length ? <p className="text-sm text-muted-foreground">No active calls to join yet.</p> : null}
      </CardContent>
    </Card>
  );
}

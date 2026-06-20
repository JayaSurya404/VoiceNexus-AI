"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RealtimeTranscriptEventDto } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LiveTranscriptPanel({
  partialTranscripts,
  transcripts,
}: Readonly<{
  partialTranscripts: Record<string, RealtimeTranscriptEventDto>;
  transcripts: RealtimeTranscriptEventDto[];
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const partials = useMemo(() => Object.values(partialTranscripts), [partialTranscripts]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [partials.length, transcripts.length]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Live transcript</CardTitle>
        <Badge variant={partials.length > 0 ? "default" : "outline"}>
          {partials.length > 0 ? "Listening" : "Waiting"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto rounded-2xl border bg-slate-50 p-4" ref={containerRef}>
          {transcripts.length === 0 && partials.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              Customer speech will appear here as Deepgram returns partial and final transcripts.
            </div>
          ) : (
            <div className="space-y-3">
              {transcripts.map((transcript) => (
                <TranscriptBubble key={transcript.id} transcript={transcript} />
              ))}
              {partials.map((transcript) => (
                <TranscriptBubble key={`${transcript.callSessionId}-partial`} partial transcript={transcript} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TranscriptBubble({
  partial = false,
  transcript,
}: Readonly<{
  partial?: boolean;
  transcript: RealtimeTranscriptEventDto;
}>) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={partial ? "secondary" : "default"}>{partial ? "Partial" : "Final"}</Badge>
        <span className="text-xs font-medium text-muted-foreground">{transcript.speaker}</span>
        <span className="font-mono text-xs text-muted-foreground">{transcript.callSessionId}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(transcript.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <p className={partial ? "mt-3 text-sm italic text-slate-500" : "mt-3 text-sm text-slate-900"}>
        {transcript.text}
      </p>
      {transcript.confidence !== null ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Confidence {(transcript.confidence * 100).toFixed(1)}%
          {transcript.language ? ` · ${transcript.language}` : ""}
        </p>
      ) : null}
    </div>
  );
}

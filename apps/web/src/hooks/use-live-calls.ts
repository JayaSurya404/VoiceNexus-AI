"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ActiveCallSessionDto,
  LiveCallsWebSocketMessageDto,
  RealtimeEventEnvelopeDto,
  RealtimeTranscriptEventDto,
} from "@voicenexus/contracts";
import { liveCallsApi } from "@/lib/api/live-calls-api";
import { useAuthStore } from "@/store/auth-store";

export const liveCallKeys = {
  activeCalls: (organizationId: string) => ["live-calls", "active", organizationId] as const,
};

export function useActiveCalls(organizationId: string | null) {
  return useQuery({
    queryKey: liveCallKeys.activeCalls(organizationId ?? ""),
    queryFn: () => liveCallsApi.listActiveCalls(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useLiveCallsSocket(organizationId: string | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR">("DISCONNECTED");
  const [events, setEvents] = useState<RealtimeEventEnvelopeDto[]>([]);
  const [transcripts, setTranscripts] = useState<RealtimeTranscriptEventDto[]>([]);
  const [partialTranscripts, setPartialTranscripts] = useState<Record<string, RealtimeTranscriptEventDto>>({});

  const socketUrl = useMemo(() => {
    if (!organizationId || !accessToken) {
      return null;
    }

    return liveCallsApi.supervisorSocketUrl(organizationId, accessToken);
  }, [accessToken, organizationId]);

  useEffect(() => {
    if (!socketUrl || !organizationId) {
      setStatus("DISCONNECTED");
      return;
    }

    setStatus("CONNECTING");
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => setStatus("CONNECTED");
    socket.onerror = () => setStatus("ERROR");
    socket.onclose = () => setStatus((current) => (current === "ERROR" ? "ERROR" : "DISCONNECTED"));
    socket.onmessage = (message) => {
      const payload = JSON.parse(message.data as string) as LiveCallsWebSocketMessageDto;

      if (payload.type === "SNAPSHOT") {
        queryClient.setQueryData(liveCallKeys.activeCalls(organizationId), payload.calls);
        return;
      }

      setEvents((current) => [payload.event, ...current].slice(0, 50));
      applyTranscriptEvent(payload.event, setTranscripts, setPartialTranscripts);
      queryClient.setQueryData<ActiveCallSessionDto[]>(
        liveCallKeys.activeCalls(organizationId),
        (current = []) => applyRealtimeEvent(current, payload.event),
      );
    };

    return () => socket.close();
  }, [organizationId, queryClient, socketUrl]);

  return { events, partialTranscripts, status, transcripts };
}

function applyTranscriptEvent(
  event: RealtimeEventEnvelopeDto,
  setTranscripts: Dispatch<SetStateAction<RealtimeTranscriptEventDto[]>>,
  setPartialTranscripts: Dispatch<SetStateAction<Record<string, RealtimeTranscriptEventDto>>>,
): void {
  if (event.topic !== "transcript.partial" && event.topic !== "transcript.final") {
    return;
  }

  const transcript = transcriptFromEvent(event);

  if (!transcript) {
    return;
  }

  if (transcript.type === "PARTIAL") {
    setPartialTranscripts((current) => ({
      ...current,
      [transcript.callSessionId]: transcript,
    }));
    return;
  }

  setPartialTranscripts((current) => {
    const next = { ...current };
    delete next[transcript.callSessionId];
    return next;
  });
  setTranscripts((current) => [...current, transcript].slice(-150));
}

function transcriptFromEvent(event: RealtimeEventEnvelopeDto): RealtimeTranscriptEventDto | null {
  const payload = event.payload;
  const id = typeof payload.id === "string" ? payload.id : event.id;
  const text = typeof payload.text === "string" ? payload.text : "";
  const callSessionId = event.callSessionId;

  if (!text || !callSessionId) {
    return null;
  }

  return {
    id,
    aiConversationSessionId:
      typeof payload.aiConversationSessionId === "string" ? payload.aiConversationSessionId : null,
    callSessionId,
    confidence: typeof payload.confidence === "number" ? payload.confidence : null,
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : event.occurredAt,
    language: typeof payload.language === "string" ? payload.language : null,
    metadata: isRecord(payload.metadata) ? payload.metadata : {},
    organizationId: event.organizationId,
    sequenceNumber: typeof payload.sequenceNumber === "number" ? payload.sequenceNumber : 0,
    speaker:
      payload.speaker === "ASSISTANT" || payload.speaker === "SYSTEM" || payload.speaker === "CUSTOMER"
        ? payload.speaker
        : "CUSTOMER",
    text,
    type: event.topic === "transcript.final" ? "FINAL" : "PARTIAL",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function applyRealtimeEvent(
  calls: ActiveCallSessionDto[],
  event: RealtimeEventEnvelopeDto,
): ActiveCallSessionDto[] {
  if (!event.callSessionId) {
    return calls;
  }

  const lifecycleType = typeof event.payload.type === "string" ? event.payload.type : "";

  if (lifecycleType === "STREAM_ENDED") {
    return calls.filter((call) => call.callSessionId !== event.callSessionId);
  }

  const existing = calls.find((call) => call.callSessionId === event.callSessionId);

  if (!existing) {
    if (lifecycleType === "SOCKET_CONNECTED" || lifecycleType === "STREAM_STARTED") {
      const status = event.payload.status;
      return [
        ...calls,
        {
          organizationId: event.organizationId,
          callSessionId: event.callSessionId,
          providerCallSid:
            typeof event.payload.providerCallSid === "string" ? event.payload.providerCallSid : null,
          streamSid: typeof event.payload.streamSid === "string" ? event.payload.streamSid : null,
          status:
            status === "CONNECTING" || status === "ACTIVE" || status === "ENDED" || status === "FAILED"
              ? status
              : lifecycleType === "STREAM_STARTED"
                ? "ACTIVE"
                : "CONNECTING",
          connectedAt: event.occurredAt,
          updatedAt: event.occurredAt,
          from: null,
          to: null,
        },
      ];
    }

    return calls;
  }

  const status = event.payload.status;
  const streamSid = event.payload.streamSid;

  return calls.map((call) =>
    call.callSessionId === event.callSessionId
      ? {
          ...call,
          status:
            status === "CONNECTING" || status === "ACTIVE" || status === "ENDED" || status === "FAILED"
              ? status
              : call.status,
          streamSid: typeof streamSid === "string" ? streamSid : call.streamSid,
          updatedAt: event.occurredAt,
        }
      : call,
  );
}

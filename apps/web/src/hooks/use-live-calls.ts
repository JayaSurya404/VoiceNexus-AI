"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ActiveCallSessionDto,
  LiveCallsWebSocketMessageDto,
  RealtimeEventEnvelopeDto,
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
      queryClient.setQueryData<ActiveCallSessionDto[]>(
        liveCallKeys.activeCalls(organizationId),
        (current = []) => applyRealtimeEvent(current, payload.event),
      );
    };

    return () => socket.close();
  }, [organizationId, queryClient, socketUrl]);

  return { events, status };
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

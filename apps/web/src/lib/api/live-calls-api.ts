"use client";

import type { ActiveCallSessionDto } from "@voicenexus/contracts";

import { useAuthStore } from "@/store/auth-store";

const realtimeGatewayUrl = process.env.NEXT_PUBLIC_REALTIME_GATEWAY_URL ?? "http://localhost:4001";

interface GatewayResponse<T> {
  data: T;
}

interface GatewayErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class RealtimeGatewayClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "RealtimeGatewayClientError";
  }
}

export const liveCallsApi = {
  async listActiveCalls(organizationId: string): Promise<ActiveCallSessionDto[]> {
    const accessToken = useAuthStore.getState().accessToken;
    const response = await fetch(
      `${realtimeGatewayUrl}/organizations/${encodeURIComponent(organizationId)}/live-calls`,
      {
        headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
      },
    );
    const payload = (await response.json()) as GatewayResponse<ActiveCallSessionDto[]> | GatewayErrorResponse;

    if (!response.ok) {
      const errorPayload = payload as GatewayErrorResponse;
      throw new RealtimeGatewayClientError(
        response.status,
        errorPayload.error.code,
        errorPayload.error.message,
      );
    }

    return (payload as GatewayResponse<ActiveCallSessionDto[]>).data;
  },

  supervisorSocketUrl(organizationId: string, accessToken: string): string {
    const base = new URL(realtimeGatewayUrl);
    base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
    base.pathname = `/ws/organizations/${encodeURIComponent(organizationId)}/live-calls`;
    base.searchParams.set("token", accessToken);
    return base.toString();
  },
};

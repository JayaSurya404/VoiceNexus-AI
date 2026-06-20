import type {
  CallDetailsDto,
  CallEventDto,
  CallSessionDto,
  CallStatus,
  CallTransferDto,
  CreateOutboundCallInput,
  TransferCallInput,
} from "@voicenexus/contracts";

import { apiFetch } from "./client";

export interface CallListParams {
  organizationId: string;
  leadId?: string;
  status?: CallStatus | "";
}

function queryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export const callsApi = {
  listCalls(params: CallListParams): Promise<CallSessionDto[]> {
    return apiFetch<CallSessionDto[]>(`/calls?${queryString({ ...params })}`);
  },

  createOutboundCall(input: CreateOutboundCallInput): Promise<CallSessionDto> {
    return apiFetch<CallSessionDto>("/calls/outbound", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  transferCall(input: TransferCallInput): Promise<CallTransferDto> {
    return apiFetch<CallTransferDto>("/calls/transfer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getCall(id: string, organizationId: string): Promise<CallDetailsDto> {
    return apiFetch<CallDetailsDto>(`/calls/${id}?${queryString({ organizationId })}`);
  },

  listCallEvents(id: string, organizationId: string): Promise<CallEventDto[]> {
    return apiFetch<CallEventDto[]>(`/calls/${id}/events?${queryString({ organizationId })}`);
  },
};

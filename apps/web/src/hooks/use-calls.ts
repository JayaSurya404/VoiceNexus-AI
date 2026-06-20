"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateOutboundCallInput, TransferCallInput } from "@voicenexus/contracts";
import { callsApi, type CallListParams } from "@/lib/api/calls-api";

export const callKeys = {
  calls: (params: CallListParams) => ["calls", "list", params] as const,
  call: (organizationId: string, callId: string) => ["calls", "detail", organizationId, callId] as const,
  events: (organizationId: string, callId: string) => ["calls", "events", organizationId, callId] as const,
};

export function useCalls(params: CallListParams, enabled = true) {
  return useQuery({
    queryKey: callKeys.calls(params),
    queryFn: () => callsApi.listCalls(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useCallDetails(organizationId: string | null, callId: string) {
  return useQuery({
    queryKey: callKeys.call(organizationId ?? "", callId),
    queryFn: () => callsApi.getCall(callId, organizationId ?? ""),
    enabled: Boolean(organizationId && callId),
  });
}

export function useCallEvents(organizationId: string | null, callId: string) {
  return useQuery({
    queryKey: callKeys.events(organizationId ?? "", callId),
    queryFn: () => callsApi.listCallEvents(callId, organizationId ?? ""),
    enabled: Boolean(organizationId && callId),
  });
}

export function useCreateOutboundCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOutboundCallInput) => callsApi.createOutboundCall(input),
    onSuccess: async (call) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["calls", "list"] }),
        queryClient.invalidateQueries({ queryKey: callKeys.call(call.organizationId, call.id) }),
      ]);
    },
  });
}

export function useTransferCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferCallInput) => callsApi.transferCall(input),
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["calls", "list"] }),
        queryClient.invalidateQueries({
          queryKey: callKeys.call(transfer.organizationId, transfer.callSessionId),
        }),
        queryClient.invalidateQueries({
          queryKey: callKeys.events(transfer.organizationId, transfer.callSessionId),
        }),
      ]);
    },
  });
}

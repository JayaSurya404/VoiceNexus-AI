"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateConversationMemoryInput,
  CreateCustomerMemoryInput,
  CreateCustomerPreferenceInput,
  CreateTimelineEventInput,
} from "@voicenexus/contracts";
import { memoryApi, type LeadMemoryParams, type OrganizationMemoryParams } from "@/lib/api/memory-api";

export const memoryKeys = {
  memories: (params: OrganizationMemoryParams) => ["memory", "memories", params] as const,
  bundle: (params: LeadMemoryParams) => ["memory", "bundle", params] as const,
  timeline: (params: LeadMemoryParams) => ["memory", "timeline", params] as const,
  preferences: (params: LeadMemoryParams) => ["memory", "preferences", params] as const,
};

export function useCustomerMemories(params: OrganizationMemoryParams, enabled = true) {
  return useQuery({
    queryKey: memoryKeys.memories(params),
    queryFn: () => memoryApi.listMemories(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useMemoryBundle(params: LeadMemoryParams, enabled = true) {
  return useQuery({
    queryKey: memoryKeys.bundle(params),
    queryFn: () => memoryApi.getMemoryBundle(params),
    enabled: enabled && Boolean(params.organizationId && params.leadId),
    retry: false,
  });
}

export function useTimeline(params: LeadMemoryParams, enabled = true) {
  return useQuery({
    queryKey: memoryKeys.timeline(params),
    queryFn: () => memoryApi.listTimeline(params),
    enabled: enabled && Boolean(params.organizationId && params.leadId),
  });
}

export function usePreferences(params: LeadMemoryParams, enabled = true) {
  return useQuery({
    queryKey: memoryKeys.preferences(params),
    queryFn: () => memoryApi.getPreferences(params),
    enabled: enabled && Boolean(params.organizationId && params.leadId),
  });
}

export function useUpsertCustomerMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerMemoryInput) => memoryApi.upsertCustomerMemory(input),
    onSuccess: async (memory) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["memory", "memories"] }),
        queryClient.invalidateQueries({
          queryKey: memoryKeys.bundle({ organizationId: memory.organizationId, leadId: memory.leadId }),
        }),
      ]);
    },
  });
}

export function useCreateConversationMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationMemoryInput) => memoryApi.createConversationMemory(input),
    onSuccess: async (memory) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["memory", "memories"] }),
        queryClient.invalidateQueries({
          queryKey: memoryKeys.bundle({ organizationId: memory.organizationId, leadId: memory.leadId }),
        }),
      ]);
    },
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTimelineEventInput) => memoryApi.createTimelineEvent(input),
    onSuccess: async (event) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: memoryKeys.timeline({ organizationId: event.organizationId, leadId: event.leadId }),
        }),
        queryClient.invalidateQueries({
          queryKey: memoryKeys.bundle({ organizationId: event.organizationId, leadId: event.leadId }),
        }),
      ]);
    },
  });
}

export function useUpsertPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerPreferenceInput) => memoryApi.upsertPreferences(input),
    onSuccess: async (preferences) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: memoryKeys.preferences({
            organizationId: preferences.organizationId,
            leadId: preferences.leadId,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: memoryKeys.bundle({ organizationId: preferences.organizationId, leadId: preferences.leadId }),
        }),
      ]);
    },
  });
}

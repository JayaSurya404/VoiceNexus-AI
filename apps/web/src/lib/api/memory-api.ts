import type {
  ConversationMemoryDto,
  CreateConversationMemoryInput,
  CreateCustomerMemoryInput,
  CreateCustomerPreferenceInput,
  CreateTimelineEventInput,
  CustomerMemoryDto,
  CustomerPreferenceDto,
  MemoryBundleDto,
  TimelineEventDto,
} from "@voicenexus/contracts";

import { apiFetch } from "./client";

export interface OrganizationMemoryParams {
  organizationId: string;
}

export interface LeadMemoryParams {
  organizationId: string;
  leadId: string;
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

export const memoryApi = {
  listMemories(params: OrganizationMemoryParams): Promise<CustomerMemoryDto[]> {
    return apiFetch<CustomerMemoryDto[]>(`/memories?${queryString({ organizationId: params.organizationId })}`);
  },

  upsertCustomerMemory(input: CreateCustomerMemoryInput): Promise<CustomerMemoryDto> {
    return apiFetch<CustomerMemoryDto>("/memories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createConversationMemory(input: CreateConversationMemoryInput): Promise<ConversationMemoryDto> {
    return apiFetch<ConversationMemoryDto>("/memories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getMemoryBundle(params: LeadMemoryParams): Promise<MemoryBundleDto> {
    return apiFetch<MemoryBundleDto>(`/memories/${params.leadId}?${queryString({ organizationId: params.organizationId })}`);
  },

  listTimeline(params: LeadMemoryParams): Promise<TimelineEventDto[]> {
    return apiFetch<TimelineEventDto[]>(`/timeline/${params.leadId}?${queryString({ organizationId: params.organizationId })}`);
  },

  createTimelineEvent(input: CreateTimelineEventInput): Promise<TimelineEventDto> {
    return apiFetch<TimelineEventDto>("/timeline", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getPreferences(params: LeadMemoryParams): Promise<CustomerPreferenceDto | null> {
    return apiFetch<CustomerPreferenceDto | null>(
      `/preferences/${params.leadId}?${queryString({ organizationId: params.organizationId })}`,
    );
  },

  upsertPreferences(input: CreateCustomerPreferenceInput): Promise<CustomerPreferenceDto> {
    return apiFetch<CustomerPreferenceDto>("/preferences", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateActivityInput,
  CreateContactInput,
  CreateLeadInput,
  CreateNoteInput,
  CreateTagInput,
  UpdateLeadInput,
} from "@voicenexus/contracts";
import { crmApi, type LeadListParams, type OrganizationParams } from "@/lib/api/crm-api";

export const crmKeys = {
  leads: (params: LeadListParams) => ["crm", "leads", params] as const,
  lead: (organizationId: string, leadId: string) => ["crm", "lead", organizationId, leadId] as const,
  contacts: (params: OrganizationParams) => ["crm", "contacts", params] as const,
  activities: (params: OrganizationParams) => ["crm", "activities", params] as const,
  notes: (params: OrganizationParams) => ["crm", "notes", params] as const,
  tags: (organizationId: string) => ["crm", "tags", organizationId] as const,
};

export function useLeads(params: LeadListParams, enabled = true) {
  return useQuery({
    queryKey: crmKeys.leads(params),
    queryFn: () => crmApi.listLeads(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useLead(organizationId: string | null, leadId: string) {
  return useQuery({
    queryKey: crmKeys.lead(organizationId ?? "", leadId),
    queryFn: () => crmApi.getLead(leadId, organizationId ?? ""),
    enabled: Boolean(organizationId && leadId),
  });
}

export function useContacts(params: OrganizationParams, enabled = true) {
  return useQuery({
    queryKey: crmKeys.contacts(params),
    queryFn: () => crmApi.listContacts(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useActivities(params: OrganizationParams, enabled = true) {
  return useQuery({
    queryKey: crmKeys.activities(params),
    queryFn: () => crmApi.listActivities(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useNotes(params: OrganizationParams, enabled = true) {
  return useQuery({
    queryKey: crmKeys.notes(params),
    queryFn: () => crmApi.listNotes(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useTags(organizationId: string | null) {
  return useQuery({
    queryKey: crmKeys.tags(organizationId ?? ""),
    queryFn: () => crmApi.listTags({ organizationId: organizationId ?? "" }),
    enabled: Boolean(organizationId),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadInput) => crmApi.createLead(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) => crmApi.updateLead(id, input),
    onSuccess: async (lead) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm", "leads"] }),
        queryClient.invalidateQueries({ queryKey: crmKeys.lead(lead.organizationId, lead.id) }),
      ]);
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => crmApi.createContact(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityInput) => crmApi.createActivity(input),
    onSuccess: async (_activity, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm", "activities"] }),
        queryClient.invalidateQueries({ queryKey: ["crm", "leads"] }),
        queryClient.invalidateQueries({ queryKey: crmKeys.lead(input.organizationId, input.leadId) }),
      ]);
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => crmApi.createNote(input),
    onSuccess: async (_note, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm", "notes"] }),
        queryClient.invalidateQueries({ queryKey: ["crm", "activities"] }),
        queryClient.invalidateQueries({ queryKey: ["crm", "leads"] }),
        queryClient.invalidateQueries({ queryKey: crmKeys.lead(input.organizationId, input.leadId) }),
      ]);
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => crmApi.createTag(input),
    onSuccess: async (tag) => {
      await queryClient.invalidateQueries({ queryKey: crmKeys.tags(tag.organizationId) });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateWhatsappAutomationInput,
  CreateWhatsappBroadcastInput,
  CreateWhatsappContactInput,
  CreateWhatsappConversationInput,
  CreateWhatsappTemplateInput,
  SendWhatsappMessageInput,
  UpdateWhatsappContactInput,
  UpdateWhatsappConversationInput,
} from "@voicenexus/contracts";
import { whatsappApi, type WhatsappListParams } from "@/lib/api/whatsapp-api";

export const whatsappKeys = {
  dashboard: (organizationId: string) => ["whatsapp", "dashboard", organizationId] as const,
  contacts: (params: WhatsappListParams) => ["whatsapp", "contacts", params] as const,
  conversations: (params: WhatsappListParams) => ["whatsapp", "conversations", params] as const,
  conversation: (organizationId: string, conversationId: string) =>
    ["whatsapp", "conversation", organizationId, conversationId] as const,
  templates: (organizationId: string) => ["whatsapp", "templates", organizationId] as const,
  broadcasts: (organizationId: string) => ["whatsapp", "broadcasts", organizationId] as const,
  automations: (organizationId: string) => ["whatsapp", "automations", organizationId] as const,
};

export function useWhatsappDashboard(organizationId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.dashboard(organizationId ?? ""),
    queryFn: () => whatsappApi.dashboard(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useWhatsappContacts(params: WhatsappListParams, enabled = true) {
  return useQuery({
    queryKey: whatsappKeys.contacts(params),
    queryFn: () => whatsappApi.listContacts(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useWhatsappConversations(params: WhatsappListParams, enabled = true) {
  return useQuery({
    queryKey: whatsappKeys.conversations(params),
    queryFn: () => whatsappApi.listConversations(params),
    enabled: enabled && Boolean(params.organizationId),
  });
}

export function useWhatsappConversation(organizationId: string | null, conversationId: string) {
  return useQuery({
    queryKey: whatsappKeys.conversation(organizationId ?? "", conversationId),
    queryFn: () => whatsappApi.getConversation(conversationId, organizationId ?? ""),
    enabled: Boolean(organizationId && conversationId),
  });
}

export function useWhatsappTemplates(organizationId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.templates(organizationId ?? ""),
    queryFn: () => whatsappApi.listTemplates(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useWhatsappBroadcasts(organizationId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.broadcasts(organizationId ?? ""),
    queryFn: () => whatsappApi.listBroadcasts(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useWhatsappAutomations(organizationId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.automations(organizationId ?? ""),
    queryFn: () => whatsappApi.listAutomations(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useCreateWhatsappContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWhatsappContactInput) => whatsappApi.createContact(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["whatsapp", "contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["whatsapp", "dashboard"] });
    },
  });
}

export function useUpdateWhatsappContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWhatsappContactInput }) =>
      whatsappApi.updateContact(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["whatsapp", "contacts"] });
    },
  });
}

export function useCreateWhatsappConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWhatsappConversationInput) => whatsappApi.createConversation(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      await queryClient.invalidateQueries({ queryKey: ["whatsapp", "dashboard"] });
    },
  });
}

export function useUpdateWhatsappConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWhatsappConversationInput }) =>
      whatsappApi.updateConversation(id, input),
    onSuccess: async (conversation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
        queryClient.invalidateQueries({
          queryKey: whatsappKeys.conversation(conversation.organizationId, conversation.id),
        }),
      ]);
    },
  });
}

export function useSendWhatsappMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendWhatsappMessageInput) => whatsappApi.sendMessage(input),
    onSuccess: async (message) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
        queryClient.invalidateQueries({
          queryKey: whatsappKeys.conversation(message.organizationId, message.conversationId),
        }),
      ]);
    },
  });
}

export function useCreateWhatsappTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWhatsappTemplateInput) => whatsappApi.createTemplate(input),
    onSuccess: async (template) => {
      await queryClient.invalidateQueries({ queryKey: whatsappKeys.templates(template.organizationId) });
    },
  });
}

export function useCreateWhatsappBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWhatsappBroadcastInput) => whatsappApi.createBroadcast(input),
    onSuccess: async (broadcast) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: whatsappKeys.broadcasts(broadcast.organizationId) }),
        queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
        queryClient.invalidateQueries({ queryKey: ["whatsapp", "dashboard"] }),
      ]);
    },
  });
}

export function useCreateWhatsappAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWhatsappAutomationInput) => whatsappApi.createAutomation(input),
    onSuccess: async (automation) => {
      await queryClient.invalidateQueries({ queryKey: whatsappKeys.automations(automation.organizationId) });
    },
  });
}

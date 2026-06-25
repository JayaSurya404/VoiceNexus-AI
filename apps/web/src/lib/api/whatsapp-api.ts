import type {
  CreateWhatsappAutomationInput,
  CreateWhatsappBroadcastInput,
  CreateWhatsappContactInput,
  CreateWhatsappConversationInput,
  CreateWhatsappTemplateInput,
  SendWhatsappMessageInput,
  UpdateWhatsappContactInput,
  UpdateWhatsappConversationInput,
  WhatsappAutomationDto,
  WhatsappBroadcastDto,
  WhatsappContactDto,
  WhatsappConversationDetailsDto,
  WhatsappConversationDto,
  WhatsappConversationStatus,
  WhatsappDashboardDto,
  WhatsappMessageDto,
  WhatsappTemplateDto,
} from "@voicenexus/contracts";

import { apiFetch } from "./client";

export interface WhatsappListParams {
  organizationId: string;
  search?: string;
  status?: WhatsappConversationStatus | "";
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

export const whatsappApi = {
  dashboard(organizationId: string): Promise<WhatsappDashboardDto> {
    return apiFetch<WhatsappDashboardDto>(`/whatsapp/dashboard?${queryString({ organizationId })}`);
  },

  listContacts(params: WhatsappListParams): Promise<WhatsappContactDto[]> {
    return apiFetch<WhatsappContactDto[]>(`/whatsapp/contacts?${queryString({ ...params })}`);
  },

  createContact(input: CreateWhatsappContactInput): Promise<WhatsappContactDto> {
    return apiFetch<WhatsappContactDto>("/whatsapp/contacts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateContact(id: string, input: UpdateWhatsappContactInput): Promise<WhatsappContactDto> {
    return apiFetch<WhatsappContactDto>(`/whatsapp/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  listConversations(params: WhatsappListParams): Promise<WhatsappConversationDto[]> {
    return apiFetch<WhatsappConversationDto[]>(`/whatsapp/conversations?${queryString({ ...params })}`);
  },

  createConversation(input: CreateWhatsappConversationInput): Promise<WhatsappConversationDto> {
    return apiFetch<WhatsappConversationDto>("/whatsapp/conversations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getConversation(id: string, organizationId: string): Promise<WhatsappConversationDetailsDto> {
    return apiFetch<WhatsappConversationDetailsDto>(
      `/whatsapp/conversations/${id}?${queryString({ organizationId })}`,
    );
  },

  updateConversation(id: string, input: UpdateWhatsappConversationInput): Promise<WhatsappConversationDto> {
    return apiFetch<WhatsappConversationDto>(`/whatsapp/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  sendMessage(input: SendWhatsappMessageInput): Promise<WhatsappMessageDto> {
    return apiFetch<WhatsappMessageDto>("/whatsapp/messages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listTemplates(organizationId: string): Promise<WhatsappTemplateDto[]> {
    return apiFetch<WhatsappTemplateDto[]>(`/whatsapp/templates?${queryString({ organizationId })}`);
  },

  createTemplate(input: CreateWhatsappTemplateInput): Promise<WhatsappTemplateDto> {
    return apiFetch<WhatsappTemplateDto>("/whatsapp/templates", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listBroadcasts(organizationId: string): Promise<WhatsappBroadcastDto[]> {
    return apiFetch<WhatsappBroadcastDto[]>(`/whatsapp/broadcasts?${queryString({ organizationId })}`);
  },

  createBroadcast(input: CreateWhatsappBroadcastInput): Promise<WhatsappBroadcastDto> {
    return apiFetch<WhatsappBroadcastDto>("/whatsapp/broadcasts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listAutomations(organizationId: string): Promise<WhatsappAutomationDto[]> {
    return apiFetch<WhatsappAutomationDto[]>(`/whatsapp/automations?${queryString({ organizationId })}`);
  },

  createAutomation(input: CreateWhatsappAutomationInput): Promise<WhatsappAutomationDto> {
    return apiFetch<WhatsappAutomationDto>("/whatsapp/automations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

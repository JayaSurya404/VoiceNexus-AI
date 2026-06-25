import type {
  WhatsappAutomationDto,
  WhatsappBroadcastDto,
  WhatsappContactDto,
  WhatsappConversationDetailsDto,
  WhatsappConversationDto,
  WhatsappDashboardDto,
  WhatsappMessageDto,
  WhatsappTemplateDto,
} from "@voicenexus/contracts";

import type { CustomerMemory } from "../../domain/entities/customer-memory.js";
import type { Lead } from "../../domain/entities/lead.js";
import type {
  WhatsappAutomation,
  WhatsappBroadcast,
  WhatsappContact,
  WhatsappConversation,
  WhatsappMessage,
  WhatsappTemplate,
} from "../../domain/entities/whatsapp.js";
import { toCustomerMemoryDto } from "./memory-serializers.js";
import { toLeadDto } from "./crm-serializers.js";

export function toWhatsappContactDto(contact: WhatsappContact): WhatsappContactDto {
  return {
    id: contact.id,
    organizationId: contact.organizationId,
    leadId: contact.leadId,
    displayName: contact.displayName,
    phone: contact.phone,
    email: contact.email,
    tags: contact.tags,
    notes: contact.notes,
    lastConversationAt: contact.lastConversationAt?.toISOString() ?? null,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export function toWhatsappConversationDto(
  conversation: WhatsappConversation,
  contact: WhatsappContact | null,
): WhatsappConversationDto {
  return {
    id: conversation.id,
    organizationId: conversation.organizationId,
    contactId: conversation.contactId,
    leadId: conversation.leadId,
    subject: conversation.subject,
    status: conversation.status,
    assignedTo: conversation.assignedTo,
    aiEnabled: conversation.aiEnabled,
    lastMessagePreview: conversation.lastMessagePreview,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    unreadCount: conversation.unreadCount,
    runtimeState: {
      state: conversation.runtimeState,
      updatedAt: conversation.runtimeUpdatedAt.toISOString(),
    },
    contact: contact ? toWhatsappContactDto(contact) : null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function toWhatsappMessageDto(message: WhatsappMessage): WhatsappMessageDto {
  return {
    id: message.id,
    organizationId: message.organizationId,
    conversationId: message.conversationId,
    contactId: message.contactId,
    direction: message.direction,
    body: message.body,
    status: message.status,
    sentBy: message.sentBy,
    isAiGenerated: message.isAiGenerated,
    metadata: message.metadata,
    createdAt: message.createdAt.toISOString(),
  };
}

export function toWhatsappTemplateDto(template: WhatsappTemplate): WhatsappTemplateDto {
  return {
    id: template.id,
    organizationId: template.organizationId,
    name: template.name,
    category: template.category,
    language: template.language,
    body: template.body,
    variables: template.variables,
    status: template.status,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

export function toWhatsappBroadcastDto(broadcast: WhatsappBroadcast): WhatsappBroadcastDto {
  return {
    id: broadcast.id,
    organizationId: broadcast.organizationId,
    name: broadcast.name,
    templateId: broadcast.templateId,
    messageBody: broadcast.messageBody,
    contactIds: broadcast.contactIds,
    status: broadcast.status,
    scheduledAt: broadcast.scheduledAt?.toISOString() ?? null,
    sentAt: broadcast.sentAt?.toISOString() ?? null,
    metrics: broadcast.metrics,
    createdBy: broadcast.createdBy,
    createdAt: broadcast.createdAt.toISOString(),
    updatedAt: broadcast.updatedAt.toISOString(),
  };
}

export function toWhatsappAutomationDto(automation: WhatsappAutomation): WhatsappAutomationDto {
  return {
    id: automation.id,
    organizationId: automation.organizationId,
    name: automation.name,
    trigger: automation.trigger,
    keyword: automation.keyword,
    responseBody: automation.responseBody,
    isEnabled: automation.isEnabled,
    createdAt: automation.createdAt.toISOString(),
    updatedAt: automation.updatedAt.toISOString(),
  };
}

export function toWhatsappConversationDetailsDto(input: {
  conversation: WhatsappConversation;
  contact: WhatsappContact | null;
  messages: WhatsappMessage[];
  lead: Lead | null;
  memory: CustomerMemory | null;
}): WhatsappConversationDetailsDto {
  return {
    conversation: toWhatsappConversationDto(input.conversation, input.contact),
    messages: input.messages.map(toWhatsappMessageDto),
    lead: input.lead ? toLeadDto(input.lead, []) : null,
    memory: input.memory ? toCustomerMemoryDto(input.memory, []) : null,
  };
}

export function toWhatsappDashboardDto(input: WhatsappDashboardDto): WhatsappDashboardDto {
  return input;
}

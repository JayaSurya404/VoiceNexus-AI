import type {
  CreateWhatsappAutomationPayload,
  CreateWhatsappBroadcastPayload,
  CreateWhatsappContactPayload,
  CreateWhatsappConversationPayload,
  CreateWhatsappTemplatePayload,
  ListWhatsappPayload,
  SendWhatsappMessagePayload,
  UpdateWhatsappContactPayload,
  UpdateWhatsappConversationPayload,
  WhatsappAutomationDto,
  WhatsappBroadcastDto,
  WhatsappContactDto,
  WhatsappConversationDetailsDto,
  WhatsappConversationDto,
  WhatsappDashboardDto,
  WhatsappMessageDto,
  WhatsappTemplateDto,
} from "@voicenexus/contracts";

import {
  toWhatsappAutomationDto,
  toWhatsappBroadcastDto,
  toWhatsappContactDto,
  toWhatsappConversationDetailsDto,
  toWhatsappConversationDto,
  toWhatsappDashboardDto,
  toWhatsappMessageDto,
  toWhatsappTemplateDto,
} from "../dto/whatsapp-serializers.js";
import type {
  ActivityRepository,
  ConversationMemoryRepository,
  CustomerMemoryRepository,
  LeadRepository,
  OrganizationMemberRepository,
  TimelineEventRepository,
  WhatsappAutomationRepository,
  WhatsappBroadcastRepository,
  WhatsappContactRepository,
  WhatsappConversationRepository,
  WhatsappMessageRepository,
  WhatsappTemplateRepository,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class WhatsappService {
  constructor(
    private readonly contacts: WhatsappContactRepository,
    private readonly conversations: WhatsappConversationRepository,
    private readonly messages: WhatsappMessageRepository,
    private readonly templates: WhatsappTemplateRepository,
    private readonly broadcasts: WhatsappBroadcastRepository,
    private readonly automations: WhatsappAutomationRepository,
    private readonly leads: LeadRepository,
    private readonly activities: ActivityRepository,
    private readonly conversationMemories: ConversationMemoryRepository,
    private readonly customerMemories: CustomerMemoryRepository,
    private readonly timelineEvents: TimelineEventRepository,
    private readonly members: OrganizationMemberRepository,
  ) {}

  async dashboard(actor: AuthenticatedActor, organizationId: string): Promise<WhatsappDashboardDto> {
    await this.ensureOrganizationAccess(actor, organizationId);

    return toWhatsappDashboardDto({
      totalContacts: await this.contacts.countByOrganization(organizationId),
      openConversations: await this.conversations.countOpenByOrganization(organizationId),
      unreadMessages: await this.conversations.countUnreadByOrganization(organizationId),
      aiRepliesEnabled: await this.conversations.countAiEnabledByOrganization(organizationId),
      broadcastsSent: await this.broadcasts.countSentByOrganization(organizationId),
      templatesApproved: await this.templates.countApprovedByOrganization(organizationId),
    });
  }

  async listContacts(actor: AuthenticatedActor, query: ListWhatsappPayload): Promise<WhatsappContactDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const contacts = await this.contacts.listByOrganization(query.organizationId, query.search);
    return contacts.map(toWhatsappContactDto);
  }

  async createContact(actor: AuthenticatedActor, input: CreateWhatsappContactPayload): Promise<WhatsappContactDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    if (input.leadId) {
      await this.ensureLeadExists(input.organizationId, input.leadId);
    }

    const contact = await this.contacts.create({
      organizationId: input.organizationId,
      leadId: input.leadId ?? null,
      displayName: input.displayName,
      phone: input.phone,
      email: input.email ?? null,
      tags: input.tags,
      notes: input.notes,
      lastConversationAt: null,
    });

    return toWhatsappContactDto(contact);
  }

  async updateContact(
    actor: AuthenticatedActor,
    contactId: string,
    input: UpdateWhatsappContactPayload,
  ): Promise<WhatsappContactDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    if (input.leadId) {
      await this.ensureLeadExists(input.organizationId, input.leadId);
    }

    const { organizationId: _organizationId, ...changes } = input;
    const contact = await this.contacts.updateForOrganization(contactId, input.organizationId, changes);
    if (!contact) {
      throw AppError.notFound("WhatsApp contact");
    }

    return toWhatsappContactDto(contact);
  }

  async listConversations(
    actor: AuthenticatedActor,
    query: ListWhatsappPayload,
  ): Promise<WhatsappConversationDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const conversations = await this.conversations.listByOrganization(query);
    const contactMap = await this.contactMap(query.organizationId, conversations.map((conversation) => conversation.contactId));
    return conversations.map((conversation) =>
      toWhatsappConversationDto(conversation, contactMap.get(conversation.contactId) ?? null),
    );
  }

  async createConversation(
    actor: AuthenticatedActor,
    input: CreateWhatsappConversationPayload,
  ): Promise<WhatsappConversationDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const contact = await this.requireContact(input.organizationId, input.contactId);
    const now = new Date();
    const conversation = await this.conversations.create({
      organizationId: input.organizationId,
      contactId: input.contactId,
      leadId: contact.leadId,
      subject: input.subject,
      status: "OPEN",
      assignedTo: actor.userId,
      aiEnabled: true,
      lastMessagePreview: "",
      lastMessageAt: null,
      unreadCount: 0,
      runtimeState: "IDLE",
      runtimeUpdatedAt: now,
    });
    await this.contacts.touchLastConversation(contact.id, input.organizationId, now);

    return toWhatsappConversationDto(conversation, contact);
  }

  async getConversation(
    actor: AuthenticatedActor,
    organizationId: string,
    conversationId: string,
  ): Promise<WhatsappConversationDetailsDto> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const conversation = await this.requireConversation(organizationId, conversationId);
    const [contact, messages, lead, memory] = await Promise.all([
      this.contacts.findByIdForOrganization(conversation.contactId, organizationId),
      this.messages.listByConversation(organizationId, conversation.id),
      conversation.leadId ? this.leads.findByIdForOrganization(conversation.leadId, organizationId) : null,
      conversation.leadId ? this.customerMemories.findByLead(organizationId, conversation.leadId) : null,
    ]);

    return toWhatsappConversationDetailsDto({ conversation, contact, messages, lead, memory });
  }

  async updateConversation(
    actor: AuthenticatedActor,
    conversationId: string,
    input: UpdateWhatsappConversationPayload,
  ): Promise<WhatsappConversationDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const conversation = await this.conversations.updateForOrganization(conversationId, input.organizationId, {
      status: input.status,
      assignedTo: input.assignedTo,
      aiEnabled: input.aiEnabled,
      runtimeState: input.status === "RESOLVED" ? "IDLE" : undefined,
      runtimeUpdatedAt: new Date(),
    });
    if (!conversation) {
      throw AppError.notFound("WhatsApp conversation");
    }

    const contact = await this.contacts.findByIdForOrganization(conversation.contactId, input.organizationId);
    return toWhatsappConversationDto(conversation, contact);
  }

  async sendMessage(actor: AuthenticatedActor, input: SendWhatsappMessagePayload): Promise<WhatsappMessageDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const conversation = await this.requireConversation(input.organizationId, input.conversationId);
    const now = new Date();
    const body = input.useAi ? this.composeAiReply(input.body) : input.body;
    const message = await this.messages.create({
      organizationId: input.organizationId,
      conversationId: conversation.id,
      contactId: conversation.contactId,
      direction: "OUTBOUND",
      body,
      status: "SENT",
      sentBy: actor.userId,
      isAiGenerated: input.useAi,
      metadata: { runtime: input.useAi ? "AI_REPLYING" : "WAITING_FOR_CUSTOMER" },
    });

    await this.conversations.updateForOrganization(conversation.id, input.organizationId, {
      lastMessagePreview: body.slice(0, 240),
      lastMessageAt: now,
      unreadCount: 0,
      runtimeState: "WAITING_FOR_CUSTOMER",
      runtimeUpdatedAt: now,
    });
    await this.contacts.touchLastConversation(conversation.contactId, input.organizationId, now);
    await this.recordCrmAndMemory(actor, conversation.leadId, input.organizationId, body, "Outbound WhatsApp message");

    return toWhatsappMessageDto(message);
  }

  async listTemplates(actor: AuthenticatedActor, organizationId: string): Promise<WhatsappTemplateDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const templates = await this.templates.listByOrganization(organizationId);
    return templates.map(toWhatsappTemplateDto);
  }

  async createTemplate(
    actor: AuthenticatedActor,
    input: CreateWhatsappTemplatePayload,
  ): Promise<WhatsappTemplateDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const template = await this.templates.create(input);
    return toWhatsappTemplateDto(template);
  }

  async listBroadcasts(actor: AuthenticatedActor, organizationId: string): Promise<WhatsappBroadcastDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const broadcasts = await this.broadcasts.listByOrganization(organizationId);
    return broadcasts.map(toWhatsappBroadcastDto);
  }

  async createBroadcast(
    actor: AuthenticatedActor,
    input: CreateWhatsappBroadcastPayload,
  ): Promise<WhatsappBroadcastDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await Promise.all(input.contactIds.map((contactId) => this.requireContact(input.organizationId, contactId)));
    if (input.templateId) {
      const template = await this.templates.findByIdForOrganization(input.templateId, input.organizationId);
      if (!template) {
        throw AppError.notFound("WhatsApp template");
      }
    }

    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    const broadcast = await this.broadcasts.create({
      organizationId: input.organizationId,
      name: input.name,
      templateId: input.templateId ?? null,
      messageBody: input.messageBody,
      contactIds: input.contactIds,
      status: scheduledAt ? "SCHEDULED" : "SENT",
      scheduledAt,
      sentAt: scheduledAt ? null : new Date(),
      metrics: {
        total: input.contactIds.length,
        queued: scheduledAt ? input.contactIds.length : 0,
        sent: scheduledAt ? 0 : input.contactIds.length,
        failed: 0,
      },
      createdBy: actor.userId,
    });

    if (!scheduledAt) {
      await Promise.all(input.contactIds.map((contactId) => this.materializeBroadcastMessage(actor, input, contactId)));
    }

    return toWhatsappBroadcastDto(broadcast);
  }

  async listAutomations(actor: AuthenticatedActor, organizationId: string): Promise<WhatsappAutomationDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const automations = await this.automations.listByOrganization(organizationId);
    return automations.map(toWhatsappAutomationDto);
  }

  async createAutomation(
    actor: AuthenticatedActor,
    input: CreateWhatsappAutomationPayload,
  ): Promise<WhatsappAutomationDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const automation = await this.automations.create(input);
    return toWhatsappAutomationDto(automation);
  }

  private async materializeBroadcastMessage(
    actor: AuthenticatedActor,
    input: CreateWhatsappBroadcastPayload,
    contactId: string,
  ): Promise<void> {
    const contact = await this.requireContact(input.organizationId, contactId);
    const conversation = await this.conversations.create({
      organizationId: input.organizationId,
      contactId,
      leadId: contact.leadId,
      subject: input.name,
      status: "OPEN",
      assignedTo: actor.userId,
      aiEnabled: true,
      lastMessagePreview: input.messageBody.slice(0, 240),
      lastMessageAt: new Date(),
      unreadCount: 0,
      runtimeState: "WAITING_FOR_CUSTOMER",
      runtimeUpdatedAt: new Date(),
    });
    await this.messages.create({
      organizationId: input.organizationId,
      conversationId: conversation.id,
      contactId,
      direction: "OUTBOUND",
      body: input.messageBody,
      status: "SENT",
      sentBy: actor.userId,
      isAiGenerated: false,
      metadata: { broadcast: input.name },
    });
    await this.recordCrmAndMemory(actor, contact.leadId, input.organizationId, input.messageBody, "WhatsApp broadcast sent");
  }

  private async recordCrmAndMemory(
    actor: AuthenticatedActor,
    leadId: string | null,
    organizationId: string,
    content: string,
    title: string,
  ): Promise<void> {
    if (!leadId) {
      return;
    }

    await Promise.all([
      this.activities.create({
        organizationId,
        leadId,
        type: "WHATSAPP",
        title,
        description: content,
        createdBy: actor.userId,
      }),
      this.conversationMemories.create({
        organizationId,
        leadId,
        source: "WHATSAPP",
        content,
        sentiment: "NEUTRAL",
        importance: 3,
      }),
      this.timelineEvents.create({
        organizationId,
        leadId,
        eventType: "WHATSAPP_SENT",
        title,
        description: content,
        metadata: { channel: "WHATSAPP" },
        createdBy: actor.userId,
      }),
      this.leads.touchLastActivity(leadId, organizationId, new Date()),
    ]);
  }

  private composeAiReply(prompt: string): string {
    return `AI reply: ${prompt}`;
  }

  private async requireContact(organizationId: string, contactId: string) {
    const contact = await this.contacts.findByIdForOrganization(contactId, organizationId);
    if (!contact) {
      throw AppError.notFound("WhatsApp contact");
    }
    return contact;
  }

  private async requireConversation(organizationId: string, conversationId: string) {
    const conversation = await this.conversations.findByIdForOrganization(conversationId, organizationId);
    if (!conversation) {
      throw AppError.notFound("WhatsApp conversation");
    }
    return conversation;
  }

  private async contactMap(organizationId: string, contactIds: string[]) {
    const contacts = await Promise.all(
      [...new Set(contactIds)].map((contactId) => this.contacts.findByIdForOrganization(contactId, organizationId)),
    );
    return new Map(contacts.filter((contact) => contact !== null).map((contact) => [contact.id, contact]));
  }

  private async ensureLeadExists(organizationId: string, leadId: string): Promise<void> {
    const lead = await this.leads.findByIdForOrganization(leadId, organizationId);
    if (!lead) {
      throw AppError.notFound("Lead");
    }
  }

  private async ensureOrganizationAccess(actor: AuthenticatedActor, organizationId: string): Promise<void> {
    if (actor.platformRole === "SUPER_ADMIN") {
      return;
    }

    const membership = await this.members.findByUserAndOrganization(actor.userId, organizationId);
    if (!membership || membership.status !== "ACTIVE") {
      throw AppError.forbidden("You do not have access to this organization");
    }
  }
}

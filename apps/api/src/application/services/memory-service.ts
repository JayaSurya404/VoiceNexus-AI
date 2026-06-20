import type {
  ConversationMemoryDto,
  CreateConversationMemoryPayload,
  CreateCustomerMemoryPayload,
  CreateCustomerPreferencePayload,
  CreateTimelineEventPayload,
  CustomerMemoryDto,
  CustomerPreferenceDto,
  MemoryBundleDto,
  OrganizationScopedQueryPayload,
  TimelineEventDto,
} from "@voicenexus/contracts";

import {
  toConversationMemoryDto,
  toCustomerMemoryDto,
  toCustomerPreferenceDto,
  toTimelineEventDto,
} from "../dto/memory-serializers.js";
import type {
  ConversationMemoryRepository,
  CustomerMemoryRepository,
  CustomerPreferenceRepository,
  LeadRepository,
  MemoryTagRepository,
  OrganizationMemberRepository,
  TimelineEventRepository,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class MemoryService {
  constructor(
    private readonly customerMemories: CustomerMemoryRepository,
    private readonly conversationMemories: ConversationMemoryRepository,
    private readonly timelineEvents: TimelineEventRepository,
    private readonly preferences: CustomerPreferenceRepository,
    private readonly memoryTags: MemoryTagRepository,
    private readonly leads: LeadRepository,
    private readonly members: OrganizationMemberRepository,
  ) {}

  async listMemories(actor: AuthenticatedActor, query: OrganizationScopedQueryPayload): Promise<CustomerMemoryDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);

    const memories = await this.customerMemories.listByOrganization(query.organizationId);
    const tags = await this.memoryTags.findByIdsForOrganization(
      [...new Set(memories.flatMap((memory) => memory.memoryTags))],
      query.organizationId,
    );

    return memories.map((memory) => toCustomerMemoryDto(memory, tags));
  }

  async upsertMemory(actor: AuthenticatedActor, input: CreateCustomerMemoryPayload): Promise<CustomerMemoryDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);
    await this.ensureMemoryTagsBelongToOrganization(input.organizationId, input.memoryTags);

    const memory = await this.customerMemories.upsert({
      organizationId: input.organizationId,
      leadId: input.leadId,
      summary: input.summary,
      relationshipScore: input.relationshipScore,
      lastInteractionAt: new Date(),
      memoryTags: input.memoryTags,
    });
    const tags = await this.memoryTags.findByIdsForOrganization(memory.memoryTags, memory.organizationId);

    return toCustomerMemoryDto(memory, tags);
  }

  async createConversationMemory(
    actor: AuthenticatedActor,
    input: CreateConversationMemoryPayload,
  ): Promise<ConversationMemoryDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);

    const memory = await this.conversationMemories.create(input);
    await this.customerMemories.upsert({
      organizationId: input.organizationId,
      leadId: input.leadId,
      summary: input.content.slice(0, 5000),
      relationshipScore: input.sentiment === "POSITIVE" ? 70 : input.sentiment === "NEGATIVE" ? 35 : 50,
      lastInteractionAt: new Date(),
      memoryTags: [],
    });

    return toConversationMemoryDto(memory);
  }

  async getMemoryBundle(
    actor: AuthenticatedActor,
    organizationId: string,
    leadId: string,
  ): Promise<MemoryBundleDto> {
    await this.ensureOrganizationAccess(actor, organizationId);
    await this.ensureLeadExists(organizationId, leadId);

    const memory = await this.customerMemories.findByLead(organizationId, leadId);

    if (!memory) {
      throw AppError.notFound("Customer memory");
    }

    const [tags, conversationMemories, timelineEvents, preference] = await Promise.all([
      this.memoryTags.findByIdsForOrganization(memory.memoryTags, organizationId),
      this.conversationMemories.listByLead(organizationId, leadId),
      this.timelineEvents.listByLead(organizationId, leadId),
      this.preferences.findByLead(organizationId, leadId),
    ]);

    return {
      memory: toCustomerMemoryDto(memory, tags),
      conversationMemories: conversationMemories.map(toConversationMemoryDto),
      timelineEvents: timelineEvents.map(toTimelineEventDto),
      preferences: preference ? toCustomerPreferenceDto(preference) : null,
    };
  }

  async listTimeline(actor: AuthenticatedActor, organizationId: string, leadId: string): Promise<TimelineEventDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    await this.ensureLeadExists(organizationId, leadId);
    const events = await this.timelineEvents.listByLead(organizationId, leadId);
    return events.map(toTimelineEventDto);
  }

  async createTimelineEvent(actor: AuthenticatedActor, input: CreateTimelineEventPayload): Promise<TimelineEventDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);

    const event = await this.timelineEvents.create({
      organizationId: input.organizationId,
      leadId: input.leadId,
      eventType: input.eventType,
      title: input.title,
      description: input.description,
      metadata: input.metadata,
      createdBy: actor.userId,
    });

    return toTimelineEventDto(event);
  }

  async getPreferences(
    actor: AuthenticatedActor,
    organizationId: string,
    leadId: string,
  ): Promise<CustomerPreferenceDto | null> {
    await this.ensureOrganizationAccess(actor, organizationId);
    await this.ensureLeadExists(organizationId, leadId);
    const preference = await this.preferences.findByLead(organizationId, leadId);
    return preference ? toCustomerPreferenceDto(preference) : null;
  }

  async upsertPreferences(
    actor: AuthenticatedActor,
    input: CreateCustomerPreferencePayload,
  ): Promise<CustomerPreferenceDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);
    const preference = await this.preferences.upsert(input);
    return toCustomerPreferenceDto(preference);
  }

  async importantHighlights(
    actor: AuthenticatedActor,
    organizationId: string,
  ): Promise<ConversationMemoryDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const memories = await this.conversationMemories.listImportantByOrganization(organizationId);
    return memories.map(toConversationMemoryDto);
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

  private async ensureLeadExists(organizationId: string, leadId: string): Promise<void> {
    const lead = await this.leads.findByIdForOrganization(leadId, organizationId);

    if (!lead) {
      throw AppError.notFound("Lead");
    }
  }

  private async ensureMemoryTagsBelongToOrganization(organizationId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const tags = await this.memoryTags.findByIdsForOrganization(tagIds, organizationId);

    if (tags.length !== new Set(tagIds).size) {
      throw AppError.badRequest("INVALID_MEMORY_TAGS", "One or more memory tags do not belong to this organization");
    }
  }
}

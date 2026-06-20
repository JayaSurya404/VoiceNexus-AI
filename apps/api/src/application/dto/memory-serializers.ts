import type {
  ConversationMemoryDto,
  CustomerMemoryDto,
  CustomerPreferenceDto,
  MemoryTagDto,
  TimelineEventDto,
} from "@voicenexus/contracts";

import type { ConversationMemory } from "../../domain/entities/conversation-memory.js";
import type { CustomerMemory } from "../../domain/entities/customer-memory.js";
import type { CustomerPreference } from "../../domain/entities/customer-preference.js";
import type { MemoryTag } from "../../domain/entities/memory-tag.js";
import type { TimelineEvent } from "../../domain/entities/timeline-event.js";

export function toMemoryTagDto(tag: MemoryTag): MemoryTagDto {
  return {
    id: tag.id,
    organizationId: tag.organizationId,
    name: tag.name,
    description: tag.description,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export function toCustomerMemoryDto(memory: CustomerMemory, tags: MemoryTag[]): CustomerMemoryDto {
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  return {
    id: memory.id,
    organizationId: memory.organizationId,
    leadId: memory.leadId,
    summary: memory.summary,
    relationshipScore: memory.relationshipScore,
    lastInteractionAt: memory.lastInteractionAt?.toISOString() ?? null,
    memoryTags: memory.memoryTags
      .map((tagId) => tagById.get(tagId))
      .filter((tag): tag is MemoryTag => Boolean(tag))
      .map(toMemoryTagDto),
    createdAt: memory.createdAt.toISOString(),
    updatedAt: memory.updatedAt.toISOString(),
  };
}

export function toConversationMemoryDto(memory: ConversationMemory): ConversationMemoryDto {
  return {
    id: memory.id,
    organizationId: memory.organizationId,
    leadId: memory.leadId,
    source: memory.source,
    content: memory.content,
    sentiment: memory.sentiment,
    importance: memory.importance,
    createdAt: memory.createdAt.toISOString(),
  };
}

export function toTimelineEventDto(event: TimelineEvent): TimelineEventDto {
  return {
    id: event.id,
    organizationId: event.organizationId,
    leadId: event.leadId,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    metadata: event.metadata,
    createdBy: event.createdBy,
    createdAt: event.createdAt.toISOString(),
  };
}

export function toCustomerPreferenceDto(preference: CustomerPreference): CustomerPreferenceDto {
  return {
    id: preference.id,
    organizationId: preference.organizationId,
    leadId: preference.leadId,
    language: preference.language,
    timezone: preference.timezone,
    preferredContactTime: preference.preferredContactTime,
    communicationStyle: preference.communicationStyle,
    createdAt: preference.createdAt.toISOString(),
    updatedAt: preference.updatedAt.toISOString(),
  };
}

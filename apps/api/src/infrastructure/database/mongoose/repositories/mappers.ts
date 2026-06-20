import type { Activity } from "../../../../domain/entities/activity.js";
import type { Contact } from "../../../../domain/entities/contact.js";
import type { ConversationMemory } from "../../../../domain/entities/conversation-memory.js";
import type { CustomerMemory } from "../../../../domain/entities/customer-memory.js";
import type { CustomerPreference } from "../../../../domain/entities/customer-preference.js";
import type { Lead } from "../../../../domain/entities/lead.js";
import type { MemoryTag } from "../../../../domain/entities/memory-tag.js";
import type { Note } from "../../../../domain/entities/note.js";
import type { OrganizationMember } from "../../../../domain/entities/organization-member.js";
import type { Organization } from "../../../../domain/entities/organization.js";
import type { RefreshSession } from "../../../../domain/entities/refresh-session.js";
import type { Tag } from "../../../../domain/entities/tag.js";
import type { TimelineEvent } from "../../../../domain/entities/timeline-event.js";
import type { User } from "../../../../domain/entities/user.js";
import type { ActivityMongoDocument } from "../models/activity-model.js";
import type { ContactMongoDocument } from "../models/contact-model.js";
import type { ConversationMemoryMongoDocument } from "../models/conversation-memory-model.js";
import type { CustomerMemoryMongoDocument } from "../models/customer-memory-model.js";
import type { CustomerPreferenceMongoDocument } from "../models/customer-preference-model.js";
import type { LeadMongoDocument } from "../models/lead-model.js";
import type { MemoryTagMongoDocument } from "../models/memory-tag-model.js";
import type { NoteMongoDocument } from "../models/note-model.js";
import type { OrganizationMemberMongoDocument } from "../models/organization-member-model.js";
import type { OrganizationMongoDocument } from "../models/organization-model.js";
import type { RefreshSessionMongoDocument } from "../models/refresh-session-model.js";
import type { TagMongoDocument } from "../models/tag-model.js";
import type { TimelineEventMongoDocument } from "../models/timeline-event-model.js";
import type { UserMongoDocument } from "../models/user-model.js";

export function mapUser(document: UserMongoDocument): User {
  return {
    id: document._id.toString(),
    email: document.email,
    firstName: document.firstName,
    lastName: document.lastName,
    passwordHash: document.passwordHash,
    platformRole: document.platformRole,
    status: document.status,
    lastLoginAt: document.lastLoginAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganization(document: OrganizationMongoDocument): Organization {
  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    status: document.status,
    timezone: document.timezone,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganizationMember(
  document: OrganizationMemberMongoDocument,
): OrganizationMember {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    userId: document.userId.toHexString(),
    role: document.role,
    status: document.status,
    invitedBy: document.invitedBy?.toHexString() ?? null,
    joinedAt: document.joinedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapRefreshSession(document: RefreshSessionMongoDocument): RefreshSession {
  return {
    id: document._id.toString(),
    tokenId: document.tokenId,
    familyId: document.familyId,
    userId: document.userId.toHexString(),
    tokenHash: document.tokenHash,
    expiresAt: document.expiresAt,
    revokedAt: document.revokedAt,
    replacedByTokenId: document.replacedByTokenId,
    userAgent: document.userAgent,
    ipHash: document.ipHash,
    createdAt: document.createdAt,
  };
}

export function mapLead(document: LeadMongoDocument): Lead {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    firstName: document.firstName,
    lastName: document.lastName,
    email: document.email,
    phone: document.phone,
    company: document.company,
    source: document.source,
    status: document.status,
    score: document.score,
    language: document.language,
    assignedTo: document.assignedTo?.toHexString() ?? null,
    tags: document.tags.map((tagId) => tagId.toHexString()),
    notesCount: document.notesCount,
    lastActivityAt: document.lastActivityAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapContact(document: ContactMongoDocument): Contact {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    email: document.email,
    phone: document.phone,
    preferredLanguage: document.preferredLanguage,
    timezone: document.timezone,
    customerType: document.customerType,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapActivity(document: ActivityMongoDocument): Activity {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    type: document.type,
    title: document.title,
    description: document.description,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapNote(document: NoteMongoDocument): Note {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    content: document.content,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapTag(document: TagMongoDocument): Tag {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    color: document.color,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapCustomerMemory(document: CustomerMemoryMongoDocument): CustomerMemory {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    summary: document.summary,
    relationshipScore: document.relationshipScore,
    lastInteractionAt: document.lastInteractionAt,
    memoryTags: document.memoryTags.map((tagId) => tagId.toHexString()),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapConversationMemory(document: ConversationMemoryMongoDocument): ConversationMemory {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    source: document.source,
    content: document.content,
    sentiment: document.sentiment,
    importance: document.importance,
    createdAt: document.createdAt,
  };
}

export function mapTimelineEvent(document: TimelineEventMongoDocument): TimelineEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    eventType: document.eventType,
    title: document.title,
    description: document.description,
    metadata: document.metadata,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapCustomerPreference(document: CustomerPreferenceMongoDocument): CustomerPreference {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    language: document.language,
    timezone: document.timezone,
    preferredContactTime: document.preferredContactTime,
    communicationStyle: document.communicationStyle,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapMemoryTag(document: MemoryTagMongoDocument): MemoryTag {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    description: document.description,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

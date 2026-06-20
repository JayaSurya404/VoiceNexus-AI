import type { ActivityDto, ContactDto, LeadDto, NoteDto, TagDto } from "@voicenexus/contracts";

import type { Activity } from "../../domain/entities/activity.js";
import type { Contact } from "../../domain/entities/contact.js";
import type { Lead } from "../../domain/entities/lead.js";
import type { Note } from "../../domain/entities/note.js";
import type { Tag } from "../../domain/entities/tag.js";

export function toTagDto(tag: Tag): TagDto {
  return {
    id: tag.id,
    organizationId: tag.organizationId,
    name: tag.name,
    color: tag.color,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export function toLeadDto(lead: Lead, tags: Tag[]): LeadDto {
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  return {
    id: lead.id,
    organizationId: lead.organizationId,
    firstName: lead.firstName,
    lastName: lead.lastName,
    fullName: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    status: lead.status,
    score: lead.score,
    language: lead.language,
    assignedTo: lead.assignedTo,
    tags: lead.tags
      .map((tagId) => tagById.get(tagId))
      .filter((tag): tag is Tag => Boolean(tag))
      .map(toTagDto),
    notesCount: lead.notesCount,
    lastActivityAt: lead.lastActivityAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function toContactDto(contact: Contact): ContactDto {
  return {
    id: contact.id,
    organizationId: contact.organizationId,
    leadId: contact.leadId,
    email: contact.email,
    phone: contact.phone,
    preferredLanguage: contact.preferredLanguage,
    timezone: contact.timezone,
    customerType: contact.customerType,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export function toActivityDto(activity: Activity): ActivityDto {
  return {
    id: activity.id,
    organizationId: activity.organizationId,
    leadId: activity.leadId,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    createdBy: activity.createdBy,
    createdAt: activity.createdAt.toISOString(),
  };
}

export function toNoteDto(note: Note): NoteDto {
  return {
    id: note.id,
    organizationId: note.organizationId,
    leadId: note.leadId,
    content: note.content,
    createdBy: note.createdBy,
    createdAt: note.createdAt.toISOString(),
  };
}

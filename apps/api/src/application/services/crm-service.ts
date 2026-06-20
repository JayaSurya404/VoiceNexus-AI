import type {
  ActivityDto,
  ContactDto,
  CreateActivityPayload,
  CreateContactPayload,
  CreateLeadPayload,
  CreateNotePayload,
  CreateTagPayload,
  LeadDto,
  LeadMetricsDto,
  ListLeadsPayload,
  NoteDto,
  OrganizationScopedQueryPayload,
  TagDto,
  UpdateLeadPayload,
} from "@voicenexus/contracts";

import {
  toActivityDto,
  toContactDto,
  toLeadDto,
  toNoteDto,
  toTagDto,
} from "../dto/crm-serializers.js";
import type {
  ActivityRepository,
  ContactRepository,
  LeadRepository,
  NoteRepository,
  OrganizationMemberRepository,
  TagRepository,
  TransactionManager,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class CrmService {
  constructor(
    private readonly leads: LeadRepository,
    private readonly contacts: ContactRepository,
    private readonly activities: ActivityRepository,
    private readonly notes: NoteRepository,
    private readonly tags: TagRepository,
    private readonly members: OrganizationMemberRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async listLeads(actor: AuthenticatedActor, query: ListLeadsPayload): Promise<LeadDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);

    const leads = await this.leads.list(query);
    const tags = await this.tags.findByIdsForOrganization(
      [...new Set(leads.flatMap((lead) => lead.tags))],
      query.organizationId,
    );

    return leads.map((lead) => toLeadDto(lead, tags));
  }

  async createLead(actor: AuthenticatedActor, input: CreateLeadPayload): Promise<LeadDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureTagsBelongToOrganization(input.organizationId, input.tags);

    const lead = await this.leads.create({
      organizationId: input.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      company: input.company,
      source: input.source,
      status: input.status,
      score: input.score,
      language: input.language,
      assignedTo: input.assignedTo,
      tags: input.tags,
      notesCount: 0,
      lastActivityAt: null,
    });
    const tagRecords = await this.tags.findByIdsForOrganization(lead.tags, lead.organizationId);

    return toLeadDto(lead, tagRecords);
  }

  async getLeadById(
    actor: AuthenticatedActor,
    organizationId: string,
    leadId: string,
  ): Promise<LeadDto> {
    await this.ensureOrganizationAccess(actor, organizationId);

    const lead = await this.leads.findByIdForOrganization(leadId, organizationId);

    if (!lead) {
      throw AppError.notFound("Lead");
    }

    const tagRecords = await this.tags.findByIdsForOrganization(lead.tags, lead.organizationId);
    return toLeadDto(lead, tagRecords);
  }

  async updateLead(
    actor: AuthenticatedActor,
    leadId: string,
    input: UpdateLeadPayload,
  ): Promise<LeadDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);

    if (input.tags) {
      await this.ensureTagsBelongToOrganization(input.organizationId, input.tags);
    }

    const { organizationId, ...changes } = input;
    const lead = await this.leads.updateForOrganization(leadId, organizationId, changes);

    if (!lead) {
      throw AppError.notFound("Lead");
    }

    const tagRecords = await this.tags.findByIdsForOrganization(lead.tags, lead.organizationId);
    return toLeadDto(lead, tagRecords);
  }

  async deleteLead(actor: AuthenticatedActor, organizationId: string, leadId: string): Promise<void> {
    await this.ensureOrganizationAccess(actor, organizationId);

    const deleted = await this.leads.deleteForOrganization(leadId, organizationId);

    if (!deleted) {
      throw AppError.notFound("Lead");
    }
  }

  async leadMetrics(actor: AuthenticatedActor, organizationId: string): Promise<LeadMetricsDto> {
    const leads = await this.listLeads(actor, { organizationId });

    return {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "NEW").length,
      qualifiedLeads: leads.filter((lead) => lead.status === "QUALIFIED").length,
      wonLeads: leads.filter((lead) => lead.status === "WON").length,
    };
  }

  async listContacts(actor: AuthenticatedActor, query: OrganizationScopedQueryPayload): Promise<ContactDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const contacts = await this.contacts.listByOrganization(query.organizationId);
    return contacts.map(toContactDto);
  }

  async createContact(actor: AuthenticatedActor, input: CreateContactPayload): Promise<ContactDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);

    const contact = await this.contacts.create({
      organizationId: input.organizationId,
      leadId: input.leadId,
      email: input.email ?? null,
      phone: input.phone ?? null,
      preferredLanguage: input.preferredLanguage,
      timezone: input.timezone,
      customerType: input.customerType,
    });

    return toContactDto(contact);
  }

  async listActivities(
    actor: AuthenticatedActor,
    query: OrganizationScopedQueryPayload,
  ): Promise<ActivityDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const activities = await this.activities.listByOrganization(query.organizationId, query.leadId);
    return activities.map(toActivityDto);
  }

  async createActivity(actor: AuthenticatedActor, input: CreateActivityPayload): Promise<ActivityDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);

    const now = new Date();
    const activity = await this.transactionManager.run(async (context) => {
      const createdActivity = await this.activities.create(
        {
          organizationId: input.organizationId,
          leadId: input.leadId,
          type: input.type,
          title: input.title,
          description: input.description,
          createdBy: actor.userId,
        },
        context,
      );

      await this.leads.touchLastActivity(input.leadId, input.organizationId, now);
      return createdActivity;
    });

    return toActivityDto(activity);
  }

  async listNotes(actor: AuthenticatedActor, query: OrganizationScopedQueryPayload): Promise<NoteDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const notes = await this.notes.listByOrganization(query.organizationId, query.leadId);
    return notes.map(toNoteDto);
  }

  async createNote(actor: AuthenticatedActor, input: CreateNotePayload): Promise<NoteDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    await this.ensureLeadExists(input.organizationId, input.leadId);

    const now = new Date();
    const note = await this.transactionManager.run(async (context) => {
      const createdNote = await this.notes.create(
        {
          organizationId: input.organizationId,
          leadId: input.leadId,
          content: input.content,
          createdBy: actor.userId,
        },
        context,
      );

      await this.activities.create(
        {
          organizationId: input.organizationId,
          leadId: input.leadId,
          type: "NOTE",
          title: "Note added",
          description: input.content,
          createdBy: actor.userId,
        },
        context,
      );
      await this.leads.incrementNotesCount(input.leadId, input.organizationId, now);

      return createdNote;
    });

    return toNoteDto(note);
  }

  async listTags(actor: AuthenticatedActor, query: OrganizationScopedQueryPayload): Promise<TagDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const tags = await this.tags.listByOrganization(query.organizationId);
    return tags.map(toTagDto);
  }

  async createTag(actor: AuthenticatedActor, input: CreateTagPayload): Promise<TagDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);

    const tag = await this.tags.create({
      organizationId: input.organizationId,
      name: input.name,
      color: input.color,
    });

    return toTagDto(tag);
  }

  private async ensureOrganizationAccess(
    actor: AuthenticatedActor,
    organizationId: string,
  ): Promise<void> {
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

  private async ensureTagsBelongToOrganization(organizationId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const tags = await this.tags.findByIdsForOrganization(tagIds, organizationId);

    if (tags.length !== new Set(tagIds).size) {
      throw AppError.badRequest("INVALID_TAGS", "One or more tags do not belong to this organization");
    }
  }
}

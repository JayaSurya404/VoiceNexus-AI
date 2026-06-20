import type {
  ActivityDto,
  ContactDto,
  CreateActivityInput,
  CreateContactInput,
  CreateLeadInput,
  CreateNoteInput,
  CreateTagInput,
  LeadDto,
  LeadStatus,
  NoteDto,
  TagDto,
  UpdateLeadInput,
} from "@voicenexus/contracts";

import { apiFetch } from "./client";

export interface LeadListParams {
  organizationId: string;
  search?: string;
  status?: LeadStatus | "";
  assignedTo?: string;
  tag?: string;
}

export interface OrganizationParams {
  organizationId: string;
  leadId?: string;
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

export const crmApi = {
  listLeads(params: LeadListParams): Promise<LeadDto[]> {
    return apiFetch<LeadDto[]>(`/leads?${queryString({ ...params })}`);
  },

  createLead(input: CreateLeadInput): Promise<LeadDto> {
    return apiFetch<LeadDto>("/leads", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getLead(id: string, organizationId: string): Promise<LeadDto> {
    return apiFetch<LeadDto>(`/leads/${id}?${queryString({ organizationId })}`);
  },

  updateLead(id: string, input: UpdateLeadInput): Promise<LeadDto> {
    return apiFetch<LeadDto>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteLead(id: string, organizationId: string): Promise<void> {
    return apiFetch<void>(`/leads/${id}?${queryString({ organizationId })}`, {
      method: "DELETE",
    });
  },

  listContacts(params: OrganizationParams): Promise<ContactDto[]> {
    return apiFetch<ContactDto[]>(`/contacts?${queryString({ ...params })}`);
  },

  createContact(input: CreateContactInput): Promise<ContactDto> {
    return apiFetch<ContactDto>("/contacts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listActivities(params: OrganizationParams): Promise<ActivityDto[]> {
    return apiFetch<ActivityDto[]>(`/activities?${queryString({ ...params })}`);
  },

  createActivity(input: CreateActivityInput): Promise<ActivityDto> {
    return apiFetch<ActivityDto>("/activities", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listNotes(params: OrganizationParams): Promise<NoteDto[]> {
    return apiFetch<NoteDto[]>(`/notes?${queryString({ ...params })}`);
  },

  createNote(input: CreateNoteInput): Promise<NoteDto> {
    return apiFetch<NoteDto>("/notes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listTags(params: OrganizationParams): Promise<TagDto[]> {
    return apiFetch<TagDto[]>(`/tags?${queryString({ organizationId: params.organizationId })}`);
  },

  createTag(input: CreateTagInput): Promise<TagDto> {
    return apiFetch<TagDto>("/tags", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

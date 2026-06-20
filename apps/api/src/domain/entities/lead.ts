import type { LeadStatus } from "@voicenexus/contracts";

export interface Lead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string;
  source: string;
  status: LeadStatus;
  score: number;
  language: string;
  assignedTo: string | null;
  tags: string[];
  notesCount: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewLead {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string;
  source: string;
  status: LeadStatus;
  score: number;
  language: string;
  assignedTo: string | null;
  tags: string[];
  notesCount: number;
  lastActivityAt: Date | null;
}

export type LeadUpdate = Partial<
  Pick<
    Lead,
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "company"
    | "source"
    | "status"
    | "score"
    | "language"
    | "assignedTo"
    | "tags"
  >
>;

export interface LeadListQuery {
  organizationId: string;
  search?: string;
  status?: LeadStatus;
  assignedTo?: string;
  tag?: string;
}

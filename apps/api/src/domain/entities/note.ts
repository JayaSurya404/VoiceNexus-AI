export interface Note {
  id: string;
  organizationId: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface NewNote {
  organizationId: string;
  leadId: string;
  content: string;
  createdBy: string;
}

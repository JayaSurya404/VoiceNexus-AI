import type { CustomerType } from "@voicenexus/contracts";

export interface Contact {
  id: string;
  organizationId: string;
  leadId: string;
  email: string | null;
  phone: string | null;
  preferredLanguage: string;
  timezone: string;
  customerType: CustomerType;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewContact {
  organizationId: string;
  leadId: string;
  email: string | null;
  phone: string | null;
  preferredLanguage: string;
  timezone: string;
  customerType: CustomerType;
}

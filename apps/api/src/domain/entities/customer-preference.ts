export interface CustomerPreference {
  id: string;
  organizationId: string;
  leadId: string;
  language: string;
  timezone: string;
  preferredContactTime: string;
  communicationStyle: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCustomerPreference {
  organizationId: string;
  leadId: string;
  language: string;
  timezone: string;
  preferredContactTime: string;
  communicationStyle: string;
}

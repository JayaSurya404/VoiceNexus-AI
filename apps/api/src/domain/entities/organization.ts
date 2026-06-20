export type OrganizationStatus = "ACTIVE" | "SUSPENDED";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  timezone: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewOrganization {
  name: string;
  slug: string;
  status: OrganizationStatus;
  timezone: string;
  createdBy: string;
}

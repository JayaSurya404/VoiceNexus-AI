export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "TRIAL" | "CANCELLED";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  ownerUserId: string | null;
  primaryEmail: string | null;
  timezone: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

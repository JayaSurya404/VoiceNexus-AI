import type { OrganizationRole } from "@voicenexus/contracts";

export type MembershipStatus = "ACTIVE" | "SUSPENDED";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: MembershipStatus;
  invitedBy: string | null;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewOrganizationMember {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: MembershipStatus;
  invitedBy: string | null;
  joinedAt: Date;
}

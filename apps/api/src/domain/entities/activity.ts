import type { ActivityType } from "@voicenexus/contracts";

export interface Activity {
  id: string;
  organizationId: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
}

export interface NewActivity {
  organizationId: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdBy: string;
}

import type { TimelineEventType } from "@voicenexus/contracts";

export interface TimelineEvent {
  id: string;
  organizationId: string;
  leadId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

export interface NewTimelineEvent {
  organizationId: string;
  leadId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: string;
}

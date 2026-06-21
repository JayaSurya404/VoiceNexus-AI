import type { ExternalActionRepository } from "../ports.js";

export class TimelineActionService {
  constructor(private readonly externalActions: ExternalActionRepository) {}

  createEvent(input: {
    organizationId: string;
    leadId: string;
    eventType: string;
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.externalActions.createTimelineEvent(input);
  }
}

import type { TimelineEventRepository } from "../../../../application/ports/repositories.js";
import type { NewTimelineEvent, TimelineEvent } from "../../../../domain/entities/timeline-event.js";
import { TimelineEventModel } from "../models/timeline-event-model.js";
import { mapTimelineEvent } from "./mappers.js";

export class MongoTimelineEventRepository implements TimelineEventRepository {
  async create(input: NewTimelineEvent): Promise<TimelineEvent> {
    const document = await TimelineEventModel.create(input);
    return mapTimelineEvent(document);
  }

  async listByLead(organizationId: string, leadId: string): Promise<TimelineEvent[]> {
    const documents = await TimelineEventModel.find({ organizationId, leadId })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapTimelineEvent);
  }
}

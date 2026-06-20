import type { RealtimeTranscriptEventRepository } from "../../../../application/ports/repositories.js";
import type {
  NewRealtimeTranscriptEvent,
  RealtimeTranscriptEvent,
} from "../../../../domain/entities/realtime-transcript-event.js";
import { RealtimeTranscriptEventModel } from "../models/realtime-transcript-event-model.js";
import { mapRealtimeTranscriptEvent } from "./mappers.js";

export class MongoRealtimeTranscriptEventRepository implements RealtimeTranscriptEventRepository {
  async create(input: NewRealtimeTranscriptEvent): Promise<RealtimeTranscriptEvent> {
    const document = await RealtimeTranscriptEventModel.create(input);
    return mapRealtimeTranscriptEvent(document);
  }

  async listByCallSession(organizationId: string, callSessionId: string): Promise<RealtimeTranscriptEvent[]> {
    const documents = await RealtimeTranscriptEventModel.find({ organizationId, callSessionId })
      .sort({ sequenceNumber: 1, createdAt: 1 })
      .exec();
    return documents.map(mapRealtimeTranscriptEvent);
  }
}

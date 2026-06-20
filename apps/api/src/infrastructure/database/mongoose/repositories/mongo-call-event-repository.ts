import type { CallEventRepository } from "../../../../application/ports/repositories.js";
import type { CallEvent, NewCallEvent } from "../../../../domain/entities/call-event.js";
import { CallEventModel } from "../models/call-event-model.js";
import { mapCallEvent } from "./mappers.js";

export class MongoCallEventRepository implements CallEventRepository {
  async create(input: NewCallEvent): Promise<CallEvent> {
    const document = await CallEventModel.create(input);
    return mapCallEvent(document);
  }

  async listByCallSession(organizationId: string, callSessionId: string): Promise<CallEvent[]> {
    const documents = await CallEventModel.find({ organizationId, callSessionId }).sort({ createdAt: 1 }).exec();
    return documents.map(mapCallEvent);
  }
}

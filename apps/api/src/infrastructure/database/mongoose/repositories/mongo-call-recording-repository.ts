import type { CallRecordingRepository } from "../../../../application/ports/repositories.js";
import type { CallRecording, NewCallRecording } from "../../../../domain/entities/call-recording.js";
import { CallRecordingModel } from "../models/call-recording-model.js";
import { mapCallRecording } from "./mappers.js";

export class MongoCallRecordingRepository implements CallRecordingRepository {
  async upsert(input: NewCallRecording): Promise<CallRecording> {
    const document = await CallRecordingModel.findOneAndUpdate(
      { providerRecordingSid: input.providerRecordingSid },
      { $set: input },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
    return mapCallRecording(document);
  }

  async listByCallSession(organizationId: string, callSessionId: string): Promise<CallRecording[]> {
    const documents = await CallRecordingModel.find({ organizationId, callSessionId })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapCallRecording);
  }
}

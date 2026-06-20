import type { CallTransferRepository } from "../../../../application/ports/repositories.js";
import type { CallTransfer, NewCallTransfer } from "../../../../domain/entities/call-transfer.js";
import { CallTransferModel } from "../models/call-transfer-model.js";
import { mapCallTransfer } from "./mappers.js";

export class MongoCallTransferRepository implements CallTransferRepository {
  async create(input: NewCallTransfer): Promise<CallTransfer> {
    const document = await CallTransferModel.create(input);
    return mapCallTransfer(document);
  }

  async listByCallSession(organizationId: string, callSessionId: string): Promise<CallTransfer[]> {
    const documents = await CallTransferModel.find({ organizationId, callSessionId })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapCallTransfer);
  }
}

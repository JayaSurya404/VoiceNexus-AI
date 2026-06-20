import type { FilterQuery } from "mongoose";

import type { CallSessionRepository } from "../../../../application/ports/repositories.js";
import type {
  CallSession,
  CallSessionListQuery,
  CallSessionUpdate,
  NewCallSession,
} from "../../../../domain/entities/call-session.js";
import { CallSessionModel, type CallSessionDocument } from "../models/call-session-model.js";
import { mapCallSession } from "./mappers.js";

export class MongoCallSessionRepository implements CallSessionRepository {
  async create(input: NewCallSession): Promise<CallSession> {
    const document = await CallSessionModel.create(input);
    return mapCallSession(document);
  }

  async list(query: CallSessionListQuery): Promise<CallSession[]> {
    const filter: FilterQuery<CallSessionDocument> = { organizationId: query.organizationId };

    if (query.leadId) {
      filter.leadId = query.leadId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const documents = await CallSessionModel.find(filter).sort({ createdAt: -1 }).exec();
    return documents.map(mapCallSession);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<CallSession | null> {
    const document = await CallSessionModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapCallSession(document) : null;
  }

  async findByProviderCallSid(providerCallSid: string): Promise<CallSession | null> {
    const document = await CallSessionModel.findOne({ providerCallSid }).exec();
    return document ? mapCallSession(document) : null;
  }

  async updateForOrganization(
    id: string,
    organizationId: string,
    input: CallSessionUpdate,
  ): Promise<CallSession | null> {
    const document = await CallSessionModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapCallSession(document) : null;
  }

  async updateByProviderCallSid(providerCallSid: string, input: CallSessionUpdate): Promise<CallSession | null> {
    const document = await CallSessionModel.findOneAndUpdate(
      { providerCallSid },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapCallSession(document) : null;
  }
}

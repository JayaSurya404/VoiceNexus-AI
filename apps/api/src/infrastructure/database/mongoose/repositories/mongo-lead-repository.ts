import type { FilterQuery } from "mongoose";

import type { LeadRepository, TransactionContext } from "../../../../application/ports/repositories.js";
import type { Lead, LeadListQuery, LeadUpdate, NewLead } from "../../../../domain/entities/lead.js";
import { LeadModel, type LeadDocument } from "../models/lead-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapLead } from "./mappers.js";

export class MongoLeadRepository implements LeadRepository {
  async create(input: NewLead, context?: TransactionContext): Promise<Lead> {
    const [document] = await LeadModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("Lead creation did not return a document");
    }

    return mapLead(document);
  }

  async list(query: LeadListQuery): Promise<Lead[]> {
    const filter: FilterQuery<LeadDocument> = { organizationId: query.organizationId };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.search) {
      const expression = new RegExp(escapeRegExp(query.search), "i");
      filter.$or = [
        { firstName: expression },
        { lastName: expression },
        { email: expression },
        { phone: expression },
        { company: expression },
      ];
    }

    const documents = await LeadModel.find(filter).sort({ createdAt: -1 }).exec();
    return documents.map(mapLead);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<Lead | null> {
    const document = await LeadModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapLead(document) : null;
  }

  async updateForOrganization(
    id: string,
    organizationId: string,
    input: LeadUpdate,
    context?: TransactionContext,
  ): Promise<Lead | null> {
    const document = await LeadModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true, session: sessionFromContext(context) },
    ).exec();

    return document ? mapLead(document) : null;
  }

  async deleteForOrganization(id: string, organizationId: string): Promise<boolean> {
    const result = await LeadModel.deleteOne({ _id: id, organizationId }).exec();
    return result.deletedCount === 1;
  }

  async touchLastActivity(id: string, organizationId: string, at: Date): Promise<void> {
    await LeadModel.updateOne({ _id: id, organizationId }, { $set: { lastActivityAt: at } }).exec();
  }

  async incrementNotesCount(id: string, organizationId: string, at: Date): Promise<void> {
    await LeadModel.updateOne(
      { _id: id, organizationId },
      { $inc: { notesCount: 1 }, $set: { lastActivityAt: at } },
    ).exec();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

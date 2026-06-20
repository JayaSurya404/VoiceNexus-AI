import type { ContactRepository, TransactionContext } from "../../../../application/ports/repositories.js";
import type { Contact, NewContact } from "../../../../domain/entities/contact.js";
import { ContactModel } from "../models/contact-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapContact } from "./mappers.js";

export class MongoContactRepository implements ContactRepository {
  async create(input: NewContact, context?: TransactionContext): Promise<Contact> {
    const [document] = await ContactModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("Contact creation did not return a document");
    }

    return mapContact(document);
  }

  async listByOrganization(organizationId: string): Promise<Contact[]> {
    const documents = await ContactModel.find({ organizationId }).sort({ createdAt: -1 }).exec();
    return documents.map(mapContact);
  }
}

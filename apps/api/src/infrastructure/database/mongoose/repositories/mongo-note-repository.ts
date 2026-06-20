import type { NoteRepository, TransactionContext } from "../../../../application/ports/repositories.js";
import type { NewNote, Note } from "../../../../domain/entities/note.js";
import { NoteModel } from "../models/note-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapNote } from "./mappers.js";

export class MongoNoteRepository implements NoteRepository {
  async create(input: NewNote, context?: TransactionContext): Promise<Note> {
    const [document] = await NoteModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("Note creation did not return a document");
    }

    return mapNote(document);
  }

  async listByOrganization(organizationId: string, leadId?: string): Promise<Note[]> {
    const documents = await NoteModel.find({
      organizationId,
      ...(leadId ? { leadId } : {}),
    })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapNote);
  }
}

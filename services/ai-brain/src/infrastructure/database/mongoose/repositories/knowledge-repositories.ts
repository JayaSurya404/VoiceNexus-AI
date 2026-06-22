import type {
  KnowledgeBaseRepository,
  KnowledgeChunkRepository,
  KnowledgeCitationRepository,
  KnowledgeDocumentRepository,
  KnowledgeSearchRepository,
} from "../../../../application/ports.js";
import type { KnowledgeBase } from "../../../../domain/entities/knowledge-base.js";
import type { KnowledgeChunk } from "../../../../domain/entities/knowledge-chunk.js";
import type { KnowledgeCitation } from "../../../../domain/entities/knowledge-citation.js";
import type { KnowledgeDocument } from "../../../../domain/entities/knowledge-document.js";
import type { KnowledgeSearch } from "../../../../domain/entities/knowledge-search.js";
import { KnowledgeBaseModel } from "../models/knowledge-base-model.js";
import { KnowledgeChunkModel } from "../models/knowledge-chunk-model.js";
import { KnowledgeCitationModel } from "../models/knowledge-citation-model.js";
import { KnowledgeDocumentModel } from "../models/knowledge-document-model.js";
import { KnowledgeSearchModel } from "../models/knowledge-search-model.js";
import {
  toKnowledgeBase,
  toKnowledgeChunk,
  toKnowledgeCitation,
  toKnowledgeDocument,
  toKnowledgeSearch,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoKnowledgeBaseRepository implements KnowledgeBaseRepository {
  async create(input: Omit<KnowledgeBase, "id" | "createdAt" | "updatedAt">) {
    const doc = await KnowledgeBaseModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      createdBy: objectId(input.createdBy),
    });
    return toKnowledgeBase(doc.toObject() as AnyDoc);
  }

  async findById(id: string) {
    const doc = await KnowledgeBaseModel.findById(id).lean();
    return doc ? toKnowledgeBase(doc as AnyDoc) : null;
  }

  async findDefault(organizationId: string) {
    const doc = await KnowledgeBaseModel.findOne({ organizationId: objectIdOrThrow(organizationId), active: true })
      .sort({ createdAt: 1 })
      .lean();
    return doc ? toKnowledgeBase(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeBaseModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ active: -1, updatedAt: -1 })
      .lean();
    return docs.map((doc) => toKnowledgeBase(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<KnowledgeBaseRepository["update"]>[2]) {
    const doc = await KnowledgeBaseModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toKnowledgeBase(doc as AnyDoc) : null;
  }
}

export class MongoKnowledgeDocumentRepository implements KnowledgeDocumentRepository {
  async create(input: Omit<KnowledgeDocument, "id" | "createdAt" | "updatedAt">) {
    const doc = await KnowledgeDocumentModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      knowledgeBaseId: objectIdOrThrow(input.knowledgeBaseId),
      uploadedBy: objectId(input.uploadedBy),
    });
    return toKnowledgeDocument(doc.toObject() as AnyDoc);
  }

  async delete(id: string, organizationId: string) {
    const result = await KnowledgeDocumentModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string) {
    const doc = await KnowledgeDocumentModel.findById(id).lean();
    return doc ? toKnowledgeDocument(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeDocumentModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeDocument(doc as AnyDoc));
  }

  async update(id: string, organizationId: string, input: Parameters<KnowledgeDocumentRepository["update"]>[2]) {
    const doc = await KnowledgeDocumentModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      input,
      { new: true },
    ).lean();
    return doc ? toKnowledgeDocument(doc as AnyDoc) : null;
  }
}

export class MongoKnowledgeChunkRepository implements KnowledgeChunkRepository {
  async createMany(input: Array<Omit<KnowledgeChunk, "id" | "createdAt" | "updatedAt">>) {
    const docs = await KnowledgeChunkModel.insertMany(
      input.map((chunk) => ({
        ...chunk,
        organizationId: objectIdOrThrow(chunk.organizationId),
        knowledgeBaseId: objectIdOrThrow(chunk.knowledgeBaseId),
        documentId: objectIdOrThrow(chunk.documentId),
      })),
      { ordered: true },
    );
    return docs.map((doc) => toKnowledgeChunk(doc.toObject() as AnyDoc));
  }

  async deleteByDocument(organizationId: string, documentId: string) {
    const result = await KnowledgeChunkModel.deleteMany({
      organizationId: objectIdOrThrow(organizationId),
      documentId: objectIdOrThrow(documentId),
    });
    return result.deletedCount;
  }

  async listByDocument(organizationId: string, documentId: string) {
    const docs = await KnowledgeChunkModel.find({
      organizationId: objectIdOrThrow(organizationId),
      documentId: objectIdOrThrow(documentId),
    }).sort({ chunkIndex: 1 }).lean();
    return docs.map((doc) => toKnowledgeChunk(doc as AnyDoc));
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeChunkModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(1000)
      .lean();
    return docs.map((doc) => toKnowledgeChunk(doc as AnyDoc));
  }
}

export class MongoKnowledgeSearchRepository implements KnowledgeSearchRepository {
  async create(input: Omit<KnowledgeSearch, "id">) {
    const doc = await KnowledgeSearchModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      resultChunkIds: input.resultChunkIds.map(objectIdOrThrow),
    });
    return toKnowledgeSearch(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeSearchModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeSearch(doc as AnyDoc));
  }
}

export class MongoKnowledgeCitationRepository implements KnowledgeCitationRepository {
  async createMany(input: Array<Omit<KnowledgeCitation, "id">>) {
    if (!input.length) return [];
    const docs = await KnowledgeCitationModel.insertMany(
      input.map((citation) => ({
        ...citation,
        organizationId: objectIdOrThrow(citation.organizationId),
        searchId: objectId(citation.searchId),
        conversationId: objectId(citation.conversationId),
        agentSessionId: objectId(citation.agentSessionId),
        documentId: objectIdOrThrow(citation.documentId),
        chunkId: objectIdOrThrow(citation.chunkId),
      })),
      { ordered: true },
    );
    return docs.map((doc) => toKnowledgeCitation(doc.toObject() as AnyDoc));
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeCitationModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeCitation(doc as AnyDoc));
  }
}

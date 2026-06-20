import type { RefreshSessionRepository } from "../../../../application/ports/repositories.js";
import type {
  NewRefreshSession,
  RefreshSession,
} from "../../../../domain/entities/refresh-session.js";
import { RefreshSessionModel } from "../models/refresh-session-model.js";
import { mapRefreshSession } from "./mappers.js";

export class MongoRefreshSessionRepository implements RefreshSessionRepository {
  async create(input: NewRefreshSession): Promise<RefreshSession> {
    const document = await RefreshSessionModel.create(input);
    return mapRefreshSession(document);
  }

  async consumeForRotation(
    tokenId: string,
    tokenHash: string,
    replacedByTokenId: string,
    now: Date,
  ): Promise<RefreshSession | null> {
    const document = await RefreshSessionModel.findOneAndUpdate(
      {
        tokenId,
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          revokedAt: now,
          replacedByTokenId,
        },
      },
      { new: false },
    ).exec();

    return document ? mapRefreshSession(document) : null;
  }

  async findByTokenId(tokenId: string): Promise<RefreshSession | null> {
    const document = await RefreshSessionModel.findOne({ tokenId }).exec();
    return document ? mapRefreshSession(document) : null;
  }

  async revokeByTokenId(tokenId: string, at: Date): Promise<void> {
    await RefreshSessionModel.updateOne(
      { tokenId, revokedAt: null },
      { $set: { revokedAt: at } },
    ).exec();
  }

  async revokeFamily(familyId: string, at: Date): Promise<void> {
    await RefreshSessionModel.updateMany(
      { familyId, revokedAt: null },
      { $set: { revokedAt: at } },
    ).exec();
  }
}

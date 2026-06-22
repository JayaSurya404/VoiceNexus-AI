import type {
  BargeInEventRepository,
  PlaybackSessionRepository,
  RealtimeConversationRepository,
  TurnEventRepository,
} from "../../../../application/ports/repositories.js";
import type {
  NewRealtimeConversation,
  RealtimeConversation,
  RealtimeConversationUpdate,
} from "../../../../domain/entities/realtime-conversation.js";
import type { NewTurnEvent, TurnEvent } from "../../../../domain/entities/turn-event.js";
import type { BargeInEvent, NewBargeInEvent } from "../../../../domain/entities/barge-in-event.js";
import type {
  NewPlaybackSession,
  PlaybackSession,
  PlaybackSessionUpdate,
} from "../../../../domain/entities/playback-session.js";
import { BargeInEventModel } from "../models/barge-in-event-model.js";
import { PlaybackSessionModel } from "../models/playback-session-model.js";
import { RealtimeConversationModel } from "../models/realtime-conversation-model.js";
import { TurnEventModel } from "../models/turn-event-model.js";
import { mapBargeInEvent, mapPlaybackSession, mapRealtimeConversation, mapTurnEvent } from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

export class MongoRealtimeConversationRepository implements RealtimeConversationRepository {
  async create(input: NewRealtimeConversation): Promise<RealtimeConversation> {
    const document = await RealtimeConversationModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      callSessionId: objectIdOrThrow(input.callSessionId),
      aiSessionId: objectId(input.aiSessionId),
      currentTurnId: objectId(input.currentTurnId),
      activePlaybackSessionId: objectId(input.activePlaybackSessionId),
      takeoverBy: objectId(input.takeoverBy),
    });
    return mapRealtimeConversation(document);
  }

  async findByCallSession(organizationId: string, callSessionId: string): Promise<RealtimeConversation | null> {
    const document = await RealtimeConversationModel.findOne({ organizationId, callSessionId }).exec();
    return document ? mapRealtimeConversation(document) : null;
  }

  async findById(id: string): Promise<RealtimeConversation | null> {
    const document = await RealtimeConversationModel.findById(id).exec();
    return document ? mapRealtimeConversation(document) : null;
  }

  async listByOrganization(organizationId: string): Promise<RealtimeConversation[]> {
    const documents = await RealtimeConversationModel.find({ organizationId }).sort({ updatedAt: -1 }).limit(100).exec();
    return documents.map(mapRealtimeConversation);
  }

  async update(id: string, input: RealtimeConversationUpdate): Promise<RealtimeConversation | null> {
    const document = await RealtimeConversationModel.findByIdAndUpdate(
      id,
      {
        ...input,
        aiSessionId: input.aiSessionId === undefined ? undefined : objectId(input.aiSessionId),
        currentTurnId: input.currentTurnId === undefined ? undefined : objectId(input.currentTurnId),
        activePlaybackSessionId:
          input.activePlaybackSessionId === undefined ? undefined : objectId(input.activePlaybackSessionId),
        takeoverBy: input.takeoverBy === undefined ? undefined : objectId(input.takeoverBy),
      },
      { new: true },
    ).exec();
    return document ? mapRealtimeConversation(document) : null;
  }
}

export class MongoTurnEventRepository implements TurnEventRepository {
  async create(input: NewTurnEvent): Promise<TurnEvent> {
    const document = await TurnEventModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      realtimeConversationId: objectIdOrThrow(input.realtimeConversationId),
      callSessionId: objectIdOrThrow(input.callSessionId),
    });
    return mapTurnEvent(document);
  }

  async listByConversation(realtimeConversationId: string): Promise<TurnEvent[]> {
    const documents = await TurnEventModel.find({ realtimeConversationId }).sort({ occurredAt: 1 }).exec();
    return documents.map(mapTurnEvent);
  }

  async listByOrganization(organizationId: string, limit = 100): Promise<TurnEvent[]> {
    const documents = await TurnEventModel.find({ organizationId }).sort({ occurredAt: -1 }).limit(limit).exec();
    return documents.map(mapTurnEvent);
  }
}

export class MongoBargeInEventRepository implements BargeInEventRepository {
  async create(input: NewBargeInEvent): Promise<BargeInEvent> {
    const document = await BargeInEventModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      realtimeConversationId: objectIdOrThrow(input.realtimeConversationId),
      callSessionId: objectIdOrThrow(input.callSessionId),
      playbackSessionId: objectId(input.playbackSessionId),
      voiceResponseId: objectId(input.voiceResponseId),
    });
    return mapBargeInEvent(document);
  }

  async listByConversation(realtimeConversationId: string): Promise<BargeInEvent[]> {
    const documents = await BargeInEventModel.find({ realtimeConversationId }).sort({ detectedAt: -1 }).exec();
    return documents.map(mapBargeInEvent);
  }

  async listByOrganization(organizationId: string, limit = 100): Promise<BargeInEvent[]> {
    const documents = await BargeInEventModel.find({ organizationId }).sort({ detectedAt: -1 }).limit(limit).exec();
    return documents.map(mapBargeInEvent);
  }
}

export class MongoPlaybackSessionRepository implements PlaybackSessionRepository {
  async create(input: NewPlaybackSession): Promise<PlaybackSession> {
    const document = await PlaybackSessionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      realtimeConversationId: objectIdOrThrow(input.realtimeConversationId),
      callSessionId: objectIdOrThrow(input.callSessionId),
      voiceResponseId: objectIdOrThrow(input.voiceResponseId),
    });
    return mapPlaybackSession(document);
  }

  async findActiveByCall(organizationId: string, callSessionId: string): Promise<PlaybackSession | null> {
    const document = await PlaybackSessionModel.findOne({
      organizationId,
      callSessionId,
      status: { $in: ["QUEUED", "PLAYING", "PAUSED"] },
    })
      .sort({ updatedAt: -1 })
      .exec();
    return document ? mapPlaybackSession(document) : null;
  }

  async findById(id: string): Promise<PlaybackSession | null> {
    const document = await PlaybackSessionModel.findById(id).exec();
    return document ? mapPlaybackSession(document) : null;
  }

  async listByConversation(realtimeConversationId: string): Promise<PlaybackSession[]> {
    const documents = await PlaybackSessionModel.find({ realtimeConversationId }).sort({ createdAt: -1 }).exec();
    return documents.map(mapPlaybackSession);
  }

  async listByOrganization(organizationId: string, limit = 100): Promise<PlaybackSession[]> {
    const documents = await PlaybackSessionModel.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).exec();
    return documents.map(mapPlaybackSession);
  }

  async update(id: string, input: PlaybackSessionUpdate): Promise<PlaybackSession | null> {
    const document = await PlaybackSessionModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return document ? mapPlaybackSession(document) : null;
  }
}

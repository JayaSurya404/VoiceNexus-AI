import type {
  NewVoiceResponse,
  VoiceResponse,
  VoiceResponseUpdate,
} from "../../../../domain/entities/voice-response.js";
import type {
  VoiceResponseMetrics,
  VoiceResponseRepository,
} from "../../../../application/ports/repositories.js";
import { VoiceResponseModel } from "../models/voice-response-model.js";
import { toVoiceResponse } from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

export class MongoVoiceResponseRepository
  implements VoiceResponseRepository
{
  async create(input: NewVoiceResponse): Promise<VoiceResponse> {
    const doc = await VoiceResponseModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sessionId: objectId(input.sessionId),
      callId: objectIdOrThrow(input.callId),
      leadId: objectId(input.leadId),
    });

    return toVoiceResponse(doc.toObject());
  }

  async findById(id: string): Promise<VoiceResponse | null> {
    const doc = await VoiceResponseModel.findById(id).lean();

    return doc ? toVoiceResponse(doc) : null;
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<VoiceResponse[]> {
    const docs = await VoiceResponseModel.find({
      organizationId: objectIdOrThrow(organizationId),
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return docs.map((doc) => toVoiceResponse(doc));
  }

  async listBySession(
    organizationId: string,
    sessionId: string,
  ): Promise<VoiceResponse[]> {
    const docs = await VoiceResponseModel.find({
      organizationId: objectIdOrThrow(organizationId),
      sessionId: objectIdOrThrow(sessionId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => toVoiceResponse(doc));
  }

  async metrics(
    organizationId: string,
  ): Promise<VoiceResponseMetrics> {
    const responses = await this.listByOrganization(organizationId);

    const completed = responses.filter(
      (response) => response.status === "COMPLETED",
    ).length;

    const providerUsage = responses.reduce<Record<string, number>>(
      (usage, response) => {
        usage[response.provider] =
          (usage[response.provider] ?? 0) + 1;

        return usage;
      },
      {},
    );

    const latencies = responses
      .map((response) => response.latencyMs)
      .filter(
        (value): value is number =>
          typeof value === "number",
      );

    return {
      responsesGenerated: responses.length,
      audioSecondsGenerated: responses.reduce(
        (total, response) =>
          total + response.durationMs / 1000,
        0,
      ),
      averageLatency: latencies.length
        ? latencies.reduce(
            (total, value) => total + value,
            0,
          ) / latencies.length
        : 0,
      providerUsage,
      playbackSuccessRate: responses.length
        ? completed / responses.length
        : 0,
    };
  }

  async update(
    id: string,
    input: VoiceResponseUpdate,
  ): Promise<VoiceResponse | null> {
    const doc = await VoiceResponseModel.findByIdAndUpdate(
      id,
      input,
      { new: true },
    ).lean();

    return doc ? toVoiceResponse(doc) : null;
  }
}
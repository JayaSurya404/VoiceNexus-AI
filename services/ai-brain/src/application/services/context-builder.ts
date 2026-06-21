import { CallSessionModel, ConversationMemoryModel, CustomerMemoryModel, CustomerPreferenceModel, LeadModel, NoteModel, TimelineEventModel } from "../../infrastructure/database/mongoose/models/external-models.js";
import { objectIdOrThrow } from "../../infrastructure/database/mongoose/repositories/repository-utils.js";

export interface ConversationContext {
  call: Record<string, unknown> | null;
  lead: Record<string, unknown> | null;
  notes: Record<string, unknown>[];
  memories: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  preferences: Record<string, unknown> | null;
  previousCalls: Record<string, unknown>[];
}

export class ContextBuilder {
  async build(input: {
    organizationId: string;
    callId: string;
    leadId: string | null;
  }): Promise<ConversationContext> {
    const organizationId = objectIdOrThrow(input.organizationId);
    const leadId = input.leadId ? objectIdOrThrow(input.leadId) : null;
    const [call, lead, notes, customerMemories, conversationMemories, timeline, preferences, previousCalls] =
      await Promise.all([
        CallSessionModel.findOne({ _id: objectIdOrThrow(input.callId), organizationId }).lean(),
        leadId ? LeadModel.findOne({ _id: leadId, organizationId }).lean() : null,
        leadId ? NoteModel.find({ organizationId, leadId }).sort({ createdAt: -1 }).limit(10).lean() : [],
        leadId ? CustomerMemoryModel.find({ organizationId, leadId }).sort({ updatedAt: -1 }).limit(5).lean() : [],
        leadId ? ConversationMemoryModel.find({ organizationId, leadId }).sort({ createdAt: -1 }).limit(10).lean() : [],
        leadId ? TimelineEventModel.find({ organizationId, leadId }).sort({ createdAt: -1 }).limit(15).lean() : [],
        leadId ? CustomerPreferenceModel.findOne({ organizationId, leadId }).lean() : null,
        leadId ? CallSessionModel.find({ organizationId, leadId }).sort({ createdAt: -1 }).limit(5).lean() : [],
      ]);

    return {
      call: asRecord(call),
      lead: asRecord(lead),
      notes: notes.map(asRecord).filter(isPresent),
      memories: [...customerMemories, ...conversationMemories].map(asRecord).filter(isPresent),
      timeline: timeline.map(asRecord).filter(isPresent),
      preferences: asRecord(preferences),
      previousCalls: previousCalls.map(asRecord).filter(isPresent),
    };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function isPresent(value: Record<string, unknown> | null): value is Record<string, unknown> {
  return Boolean(value);
}

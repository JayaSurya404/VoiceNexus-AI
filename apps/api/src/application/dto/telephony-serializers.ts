import type {
  CallDetailsDto,
  CallEventDto,
  CallMetricsDto,
  CallRecordingDto,
  CallSessionDto,
  CallTransferDto,
  PhoneNumberDto,
} from "@voicenexus/contracts";

import type { CallEvent } from "../../domain/entities/call-event.js";
import type { CallRecording } from "../../domain/entities/call-recording.js";
import type { CallSession } from "../../domain/entities/call-session.js";
import type { CallTransfer } from "../../domain/entities/call-transfer.js";
import type { PhoneNumber } from "../../domain/entities/phone-number.js";
import type { Lead } from "../../domain/entities/lead.js";
import type { Tag } from "../../domain/entities/tag.js";
import type { CustomerMemory } from "../../domain/entities/customer-memory.js";
import type { MemoryTag } from "../../domain/entities/memory-tag.js";
import { toLeadDto } from "./crm-serializers.js";
import { toCustomerMemoryDto } from "./memory-serializers.js";

export function toPhoneNumberDto(phoneNumber: PhoneNumber): PhoneNumberDto {
  return {
    id: phoneNumber.id,
    organizationId: phoneNumber.organizationId,
    provider: phoneNumber.provider,
    phoneNumber: phoneNumber.phoneNumber,
    label: phoneNumber.label,
    providerSid: phoneNumber.providerSid,
    status: phoneNumber.status,
    capabilities: phoneNumber.capabilities,
    createdAt: phoneNumber.createdAt.toISOString(),
    updatedAt: phoneNumber.updatedAt.toISOString(),
  };
}

export function toCallSessionDto(call: CallSession): CallSessionDto {
  return {
    id: call.id,
    organizationId: call.organizationId,
    leadId: call.leadId,
    phoneNumberId: call.phoneNumberId,
    provider: call.provider,
    providerCallSid: call.providerCallSid,
    direction: call.direction,
    status: call.status,
    from: call.from,
    to: call.to,
    initiatedBy: call.initiatedBy,
    startedAt: call.startedAt?.toISOString() ?? null,
    endedAt: call.endedAt?.toISOString() ?? null,
    durationSeconds: call.durationSeconds,
    recordingEnabled: call.recordingEnabled,
    createdAt: call.createdAt.toISOString(),
    updatedAt: call.updatedAt.toISOString(),
  };
}

export function toCallEventDto(event: CallEvent): CallEventDto {
  return {
    id: event.id,
    organizationId: event.organizationId,
    callSessionId: event.callSessionId,
    type: event.type,
    title: event.title,
    description: event.description,
    providerStatus: event.providerStatus,
    metadata: event.metadata,
    createdAt: event.createdAt.toISOString(),
  };
}

export function toCallRecordingDto(recording: CallRecording): CallRecordingDto {
  return {
    id: recording.id,
    organizationId: recording.organizationId,
    callSessionId: recording.callSessionId,
    providerRecordingSid: recording.providerRecordingSid,
    recordingUrl: recording.recordingUrl,
    status: recording.status,
    durationSeconds: recording.durationSeconds,
    createdAt: recording.createdAt.toISOString(),
  };
}

export function toCallTransferDto(transfer: CallTransfer): CallTransferDto {
  return {
    id: transfer.id,
    organizationId: transfer.organizationId,
    callSessionId: transfer.callSessionId,
    fromUserId: transfer.fromUserId,
    toPhoneNumber: transfer.toPhoneNumber,
    status: transfer.status,
    reason: transfer.reason,
    createdAt: transfer.createdAt.toISOString(),
  };
}

export function toCallMetricsDto(calls: CallSession[]): CallMetricsDto {
  return {
    totalCalls: calls.length,
    inboundCalls: calls.filter((call) => call.direction === "INBOUND").length,
    outboundCalls: calls.filter((call) => call.direction === "OUTBOUND").length,
    completedCalls: calls.filter((call) => call.status === "COMPLETED").length,
  };
}

export function toCallDetailsDto({
  call,
  events,
  recordings,
  transfers,
  lead,
  leadTags,
  memory,
  memoryTags,
}: {
  call: CallSession;
  events: CallEvent[];
  recordings: CallRecording[];
  transfers: CallTransfer[];
  lead: Lead | null;
  leadTags: Tag[];
  memory: CustomerMemory | null;
  memoryTags: MemoryTag[];
}): CallDetailsDto {
  return {
    call: toCallSessionDto(call),
    events: events.map(toCallEventDto),
    recordings: recordings.map(toCallRecordingDto),
    transfers: transfers.map(toCallTransferDto),
    lead: lead ? toLeadDto(lead, leadTags) : null,
    memory: memory ? toCustomerMemoryDto(memory, memoryTags) : null,
  };
}

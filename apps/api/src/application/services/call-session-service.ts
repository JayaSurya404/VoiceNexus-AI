import type {
  CallDetailsDto,
  CallEventDto,
  CallMetricsDto,
  CallSessionDto,
  ListCallsPayload,
} from "@voicenexus/contracts";

import {
  toCallDetailsDto,
  toCallEventDto,
  toCallMetricsDto,
  toCallSessionDto,
} from "../dto/telephony-serializers.js";
import type {
  CallEventRepository,
  CallRecordingRepository,
  CallSessionRepository,
  CallTransferRepository,
  CustomerMemoryRepository,
  LeadRepository,
  MemoryTagRepository,
  OrganizationMemberRepository,
  TagRepository,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class CallSessionService {
  constructor(
    private readonly calls: CallSessionRepository,
    private readonly events: CallEventRepository,
    private readonly recordings: CallRecordingRepository,
    private readonly transfers: CallTransferRepository,
    private readonly leads: LeadRepository,
    private readonly tags: TagRepository,
    private readonly customerMemories: CustomerMemoryRepository,
    private readonly memoryTags: MemoryTagRepository,
    private readonly members: OrganizationMemberRepository,
  ) {}

  async listCalls(actor: AuthenticatedActor, query: ListCallsPayload): Promise<CallSessionDto[]> {
    await this.ensureOrganizationAccess(actor, query.organizationId);
    const calls = await this.calls.list(query);
    return calls.map(toCallSessionDto);
  }

  async callMetrics(actor: AuthenticatedActor, organizationId: string): Promise<CallMetricsDto> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const calls = await this.calls.list({ organizationId });
    return toCallMetricsDto(calls);
  }

  async getCallDetails(actor: AuthenticatedActor, organizationId: string, callId: string): Promise<CallDetailsDto> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const call = await this.calls.findByIdForOrganization(callId, organizationId);

    if (!call) {
      throw AppError.notFound("Call");
    }

    const [events, recordings, transfers] = await Promise.all([
      this.events.listByCallSession(organizationId, call.id),
      this.recordings.listByCallSession(organizationId, call.id),
      this.transfers.listByCallSession(organizationId, call.id),
    ]);

    const lead = call.leadId ? await this.leads.findByIdForOrganization(call.leadId, organizationId) : null;
    const leadTags = lead ? await this.tags.findByIdsForOrganization(lead.tags, organizationId) : [];
    const memory = call.leadId ? await this.customerMemories.findByLead(organizationId, call.leadId) : null;
    const memoryTags = memory
      ? await this.memoryTags.findByIdsForOrganization(memory.memoryTags, organizationId)
      : [];

    return toCallDetailsDto({
      call,
      events,
      recordings,
      transfers,
      lead,
      leadTags,
      memory,
      memoryTags,
    });
  }

  async listCallEvents(actor: AuthenticatedActor, organizationId: string, callId: string): Promise<CallEventDto[]> {
    await this.ensureOrganizationAccess(actor, organizationId);
    const call = await this.calls.findByIdForOrganization(callId, organizationId);

    if (!call) {
      throw AppError.notFound("Call");
    }

    const events = await this.events.listByCallSession(organizationId, callId);
    return events.map(toCallEventDto);
  }

  private async ensureOrganizationAccess(actor: AuthenticatedActor, organizationId: string): Promise<void> {
    if (actor.platformRole === "SUPER_ADMIN") {
      return;
    }

    const membership = await this.members.findByUserAndOrganization(actor.userId, organizationId);

    if (!membership || membership.status !== "ACTIVE") {
      throw AppError.forbidden("You do not have access to this organization");
    }
  }
}

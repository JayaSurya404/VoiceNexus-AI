import type {
  CallEventType,
  CallSessionDto,
  CallStatus,
  CreateOutboundCallPayload,
  TransferCallPayload,
} from "@voicenexus/contracts";

import { toCallSessionDto, toCallTransferDto } from "../dto/telephony-serializers.js";
import type {
  ActivityRepository,
  CallEventRepository,
  CallSessionRepository,
  CallTransferRepository,
  ConversationMemoryRepository,
  LeadRepository,
  OrganizationMemberRepository,
  PhoneNumberRepository,
  TimelineEventRepository,
} from "../ports/repositories.js";
import type { AuthenticatedActor } from "./organization-service.js";
import type { ProviderFactory } from "../../infrastructure/telephony/provider-factory.js";
import { AppError } from "../../shared/app-error.js";

interface TelephonyServiceConfig {
  apiPublicUrl: string;
  aiVoiceWebhookUrl: string | null;
  twilioPhoneNumber: string;
}

export class TelephonyService {
  constructor(
    private readonly calls: CallSessionRepository,
    private readonly events: CallEventRepository,
    private readonly transfers: CallTransferRepository,
    private readonly phoneNumbers: PhoneNumberRepository,
    private readonly leads: LeadRepository,
    private readonly activities: ActivityRepository,
    private readonly timelineEvents: TimelineEventRepository,
    private readonly conversationMemories: ConversationMemoryRepository,
    private readonly members: OrganizationMemberRepository,
    private readonly providerFactory: ProviderFactory,
    private readonly config: TelephonyServiceConfig,
  ) {}

  async startOutboundCall(actor: AuthenticatedActor, input: CreateOutboundCallPayload): Promise<CallSessionDto> {
    await this.ensureOrganizationAccess(actor, input.organizationId);

    const lead = await this.leads.findByIdForOrganization(input.leadId, input.organizationId);

    if (!lead) {
      throw AppError.notFound("Lead");
    }

    const from = input.from ?? this.config.twilioPhoneNumber;

    if (!from) {
      throw AppError.badRequest("CALLER_ID_NOT_CONFIGURED", "A Twilio phone number is required before calling");
    }

    const phoneNumber = await this.ensureOrganizationPhoneNumber(input.organizationId, from);
    const provider = this.providerFactory.getProvider("TWILIO");
    let call = await this.calls.create({
      organizationId: input.organizationId,
      leadId: input.leadId,
      phoneNumberId: phoneNumber.id,
      provider: "TWILIO",
      providerCallSid: null,
      direction: "OUTBOUND",
      status: "QUEUED",
      from,
      to: input.to,
      initiatedBy: actor.userId,
      startedAt: null,
      endedAt: null,
      durationSeconds: null,
      recordingEnabled: input.record,
    });

    await this.createEvent(call.id, call.organizationId, "CALL_CREATED", "Outbound call created", input.initialMessage);

    try {
      const providerCall = await provider.createOutboundCall({
        to: input.to,
        from,
        voiceUrl: this.voiceWebhookUrl({
          organizationId: input.organizationId,
          apiCallSessionId: call.id,
          leadId: input.leadId,
          direction: "OUTBOUND",
        }),
        statusCallbackUrl: `${this.config.apiPublicUrl}/webhooks/twilio/status`,
        recordingStatusCallbackUrl: `${this.config.apiPublicUrl}/webhooks/twilio/recording`,
        record: input.record,
      });
      call =
        (await this.calls.updateForOrganization(call.id, call.organizationId, {
          providerCallSid: providerCall.providerCallSid,
          status: twilioStatusToCallStatus(providerCall.providerStatus),
        })) ?? call;
      await this.createEvent(
        call.id,
        call.organizationId,
        "CALL_QUEUED",
        "Twilio accepted outbound call",
        `Provider status: ${providerCall.providerStatus}`,
        providerCall.providerStatus,
      );
      await this.activities.create({
        organizationId: call.organizationId,
        leadId: input.leadId,
        type: "CALL",
        title: "Outbound call started",
        description: `Call to ${input.to}`,
        createdBy: actor.userId,
      });
    } catch (error) {
      call =
        (await this.calls.updateForOrganization(call.id, call.organizationId, {
          status: "FAILED",
          endedAt: new Date(),
        })) ?? call;
      await this.createEvent(
        call.id,
        call.organizationId,
        "CALL_FAILED",
        "Outbound call failed",
        error instanceof Error ? error.message : "Unknown provider failure",
      );
      throw error;
    }

    return toCallSessionDto(call);
  }

  async transferCall(actor: AuthenticatedActor, input: TransferCallPayload) {
    await this.ensureOrganizationAccess(actor, input.organizationId);
    const call = await this.calls.findByIdForOrganization(input.callSessionId, input.organizationId);

    if (!call) {
      throw AppError.notFound("Call");
    }

    if (!call.providerCallSid) {
      throw AppError.badRequest("CALL_NOT_CONNECTED", "This call cannot be transferred until it has a provider id");
    }

    const provider = this.providerFactory.getProvider(call.provider);

    try {
      await provider.transferCall({
        providerCallSid: call.providerCallSid,
        toPhoneNumber: input.toPhoneNumber,
      });
      const transfer = await this.transfers.create({
        organizationId: call.organizationId,
        callSessionId: call.id,
        fromUserId: actor.userId,
        toPhoneNumber: input.toPhoneNumber,
        status: "COMPLETED",
        reason: input.reason,
      });
      await this.createEvent(
        call.id,
        call.organizationId,
        "CALL_TRANSFERRED",
        "Call transferred",
        `Transferred to ${input.toPhoneNumber}`,
      );
      return toCallTransferDto(transfer);
    } catch (error) {
      const transfer = await this.transfers.create({
        organizationId: call.organizationId,
        callSessionId: call.id,
        fromUserId: actor.userId,
        toPhoneNumber: input.toPhoneNumber,
        status: "FAILED",
        reason: input.reason,
      });
      await this.createEvent(
        call.id,
        call.organizationId,
        "CALL_FAILED",
        "Call transfer failed",
        error instanceof Error ? error.message : "Unknown transfer failure",
      );
      if (transfer.status === "FAILED") {
        throw error;
      }
      return toCallTransferDto(transfer);
    }
  }

  async handleTwilioVoiceWebhook(payload: Record<string, unknown>): Promise<string> {
    const provider = this.providerFactory.getProvider("TWILIO");
    const providerCallSid = stringField(payload, "CallSid");
    const from = stringField(payload, "From");
    const to = stringField(payload, "To");

    if (!providerCallSid || !from || !to) {
      return provider.buildVoiceResponse("We could not process this call. Goodbye.");
    }

    const existingCall = await this.calls.findByProviderCallSid(providerCallSid);

    if (existingCall) {
      await this.createEvent(
        existingCall.id,
        existingCall.organizationId,
        "WEBHOOK_RECEIVED",
        "Voice webhook received",
        "Twilio requested call instructions",
      );
      return provider.buildVoiceResponse("Thanks for calling VoiceNexus AI. A team member will follow up shortly.");
    }

    const phoneNumber = await this.phoneNumbers.findByPhoneNumber(to);

    if (!phoneNumber) {
      return provider.buildVoiceResponse("This VoiceNexus phone number is not linked to a workspace yet. Goodbye.");
    }

    const call = await this.calls.create({
      organizationId: phoneNumber.organizationId,
      leadId: null,
      phoneNumberId: phoneNumber.id,
      provider: "TWILIO",
      providerCallSid,
      direction: "INBOUND",
      status: "IN_PROGRESS",
      from,
      to,
      initiatedBy: null,
      startedAt: new Date(),
      endedAt: null,
      durationSeconds: null,
      recordingEnabled: true,
    });
    await this.createEvent(call.id, call.organizationId, "CALL_ANSWERED", "Inbound call answered", `From ${from}`);

    return provider.buildVoiceResponse("Thanks for calling VoiceNexus AI. A team member will follow up shortly.");
  }

  async handleTwilioStatusWebhook(payload: Record<string, unknown>): Promise<void> {
    const providerCallSid = stringField(payload, "CallSid");

    if (!providerCallSid) {
      return;
    }

    const call = await this.calls.findByProviderCallSid(providerCallSid);

    if (!call) {
      return;
    }

    const providerStatus = stringField(payload, "CallStatus") ?? stringField(payload, "CallStatusCallbackEvent") ?? "";
    const status = twilioStatusToCallStatus(providerStatus);
    const now = new Date();
    const durationSeconds = numberField(payload, "CallDuration") ?? numberField(payload, "Duration");
    const updatedCall =
      (await this.calls.updateByProviderCallSid(providerCallSid, {
        status,
        startedAt: status === "IN_PROGRESS" && !call.startedAt ? now : call.startedAt,
        endedAt: isTerminalStatus(status) ? now : call.endedAt,
        durationSeconds: durationSeconds ?? call.durationSeconds,
      })) ?? call;

    await this.createEvent(
      updatedCall.id,
      updatedCall.organizationId,
      eventTypeForStatus(status),
      titleForStatus(status),
      `Twilio status: ${providerStatus || "unknown"}`,
      providerStatus || null,
      payload,
    );

    if (updatedCall.leadId && status === "COMPLETED") {
      await this.activities.create({
        organizationId: updatedCall.organizationId,
        leadId: updatedCall.leadId,
        type: "CALL",
        title: "Call completed",
        description: `Call duration: ${updatedCall.durationSeconds ?? 0} seconds`,
        createdBy: updatedCall.initiatedBy ?? updatedCall.leadId,
      });
      await this.timelineEvents.create({
        organizationId: updatedCall.organizationId,
        leadId: updatedCall.leadId,
        eventType: "CALL_COMPLETED",
        title: "Call completed",
        description: `Call with ${updatedCall.direction === "OUTBOUND" ? updatedCall.to : updatedCall.from}`,
        metadata: {
          callSessionId: updatedCall.id,
          durationSeconds: updatedCall.durationSeconds,
        },
        createdBy: updatedCall.initiatedBy ?? updatedCall.leadId,
      });
      await this.conversationMemories.create({
        organizationId: updatedCall.organizationId,
        leadId: updatedCall.leadId,
        source: "CALL",
        content: `Call completed. Duration: ${updatedCall.durationSeconds ?? 0} seconds.`,
        sentiment: "NEUTRAL",
        importance: 3,
      });
    }
  }

  validateTwilioWebhook(signature: string | undefined, url: string, payload: Record<string, unknown>): void {
    const provider = this.providerFactory.getProvider("TWILIO");

    if (!provider.validateWebhookSignature(signature, url, payload)) {
      throw AppError.forbidden("Twilio webhook signature is invalid");
    }
  }

  private async ensureOrganizationPhoneNumber(organizationId: string, phoneNumber: string) {
    const existing = await this.phoneNumbers.findByOrganizationAndPhoneNumber(organizationId, phoneNumber);

    if (existing) {
      return existing;
    }

    return this.phoneNumbers.create({
      organizationId,
      provider: "TWILIO",
      phoneNumber,
      label: "Twilio default voice number",
      providerSid: null,
      status: "ACTIVE",
      capabilities: {
        voice: true,
        sms: false,
        whatsapp: false,
      },
    });
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

  private async createEvent(
    callSessionId: string,
    organizationId: string,
    type: CallEventType,
    title: string,
    description: string,
    providerStatus: string | null = null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.events.create({
      organizationId,
      callSessionId,
      type,
      title,
      description,
      providerStatus,
      metadata,
    });
  }

  private voiceWebhookUrl(input: {
    organizationId: string;
    apiCallSessionId: string;
    leadId: string;
    direction: "INBOUND" | "OUTBOUND";
  }): string {
    const url = new URL(this.config.aiVoiceWebhookUrl ?? `${this.config.apiPublicUrl}/webhooks/twilio/voice`);

    if (this.config.aiVoiceWebhookUrl) {
      url.searchParams.set("organizationId", input.organizationId);
      url.searchParams.set("apiCallSessionId", input.apiCallSessionId);
      url.searchParams.set("leadId", input.leadId);
      url.searchParams.set("conversationId", input.apiCallSessionId);
      url.searchParams.set("direction", input.direction);
    }

    return url.toString();
  }
}

function twilioStatusToCallStatus(status: string): CallStatus {
  const normalized = status.toLowerCase();

  if (normalized === "ringing") {
    return "RINGING";
  }

  if (normalized === "in-progress" || normalized === "answered") {
    return "IN_PROGRESS";
  }

  if (normalized === "completed") {
    return "COMPLETED";
  }

  if (normalized === "busy") {
    return "BUSY";
  }

  if (normalized === "no-answer") {
    return "NO_ANSWER";
  }

  if (normalized === "canceled" || normalized === "cancelled") {
    return "CANCELED";
  }

  if (normalized === "failed") {
    return "FAILED";
  }

  return "QUEUED";
}

function eventTypeForStatus(status: CallStatus): CallEventType {
  if (status === "RINGING") {
    return "CALL_RINGING";
  }

  if (status === "IN_PROGRESS") {
    return "CALL_ANSWERED";
  }

  if (status === "COMPLETED") {
    return "CALL_COMPLETED";
  }

  if (["FAILED", "BUSY", "NO_ANSWER", "CANCELED"].includes(status)) {
    return "CALL_FAILED";
  }

  return "CALL_QUEUED";
}

function titleForStatus(status: CallStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isTerminalStatus(status: CallStatus): boolean {
  return ["COMPLETED", "FAILED", "BUSY", "NO_ANSWER", "CANCELED"].includes(status);
}

function stringField(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

function numberField(payload: Record<string, unknown>, key: string): number | null {
  const value = stringField(payload, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

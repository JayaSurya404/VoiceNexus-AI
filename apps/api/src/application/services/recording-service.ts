import type { CallRecordingStatus } from "@voicenexus/contracts";

import type {
  CallEventRepository,
  CallRecordingRepository,
  CallSessionRepository,
} from "../ports/repositories.js";

export class RecordingService {
  constructor(
    private readonly calls: CallSessionRepository,
    private readonly recordings: CallRecordingRepository,
    private readonly events: CallEventRepository,
  ) {}

  async handleTwilioRecordingWebhook(payload: Record<string, unknown>): Promise<void> {
    const providerCallSid = stringField(payload, "CallSid");
    const providerRecordingSid = stringField(payload, "RecordingSid");

    if (!providerCallSid || !providerRecordingSid) {
      return;
    }

    const call = await this.calls.findByProviderCallSid(providerCallSid);

    if (!call) {
      return;
    }

    const status = recordingStatus(stringField(payload, "RecordingStatus"));
    const recordingUrl = stringField(payload, "RecordingUrl") ?? "";
    const durationSeconds = numberField(payload, "RecordingDuration");

    const recording = await this.recordings.upsert({
      organizationId: call.organizationId,
      callSessionId: call.id,
      providerRecordingSid,
      recordingUrl,
      status,
      durationSeconds,
    });

    await this.events.create({
      organizationId: call.organizationId,
      callSessionId: call.id,
      type: "RECORDING_AVAILABLE",
      title: "Recording updated",
      description: `Recording ${recording.status.toLowerCase()}`,
      providerStatus: stringField(payload, "RecordingStatus"),
      metadata: {
        providerRecordingSid: recording.providerRecordingSid,
        recordingUrl: recording.recordingUrl,
        durationSeconds: recording.durationSeconds,
      },
    });
  }
}

function recordingStatus(value: string | null): CallRecordingStatus {
  if (value === "completed") {
    return "COMPLETED";
  }

  if (value === "failed") {
    return "FAILED";
  }

  return "PROCESSING";
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

import type { CallRecordingStatus } from "@voicenexus/contracts";

export interface CallRecording {
  id: string;
  organizationId: string;
  callSessionId: string;
  providerRecordingSid: string;
  recordingUrl: string;
  status: CallRecordingStatus;
  durationSeconds: number | null;
  createdAt: Date;
}

export interface NewCallRecording {
  organizationId: string;
  callSessionId: string;
  providerRecordingSid: string;
  recordingUrl: string;
  status: CallRecordingStatus;
  durationSeconds: number | null;
}

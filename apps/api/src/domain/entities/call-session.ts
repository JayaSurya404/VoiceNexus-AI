import type { CallDirection, CallStatus, TelephonyProvider } from "@voicenexus/contracts";

export interface CallSession {
  id: string;
  organizationId: string;
  leadId: string | null;
  phoneNumberId: string | null;
  provider: TelephonyProvider;
  providerCallSid: string | null;
  direction: CallDirection;
  status: CallStatus;
  from: string;
  to: string;
  initiatedBy: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  recordingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCallSession {
  organizationId: string;
  leadId: string | null;
  phoneNumberId: string | null;
  provider: TelephonyProvider;
  providerCallSid: string | null;
  direction: CallDirection;
  status: CallStatus;
  from: string;
  to: string;
  initiatedBy: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  recordingEnabled: boolean;
}

export interface CallSessionUpdate {
  providerCallSid?: string | null;
  status?: CallStatus;
  startedAt?: Date | null;
  endedAt?: Date | null;
  durationSeconds?: number | null;
}

export interface CallSessionListQuery {
  organizationId: string;
  leadId?: string;
  status?: CallStatus;
}

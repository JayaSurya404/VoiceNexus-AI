import type { CallEventType } from "@voicenexus/contracts";

export interface CallEvent {
  id: string;
  organizationId: string;
  callSessionId: string;
  type: CallEventType;
  title: string;
  description: string;
  providerStatus: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface NewCallEvent {
  organizationId: string;
  callSessionId: string;
  type: CallEventType;
  title: string;
  description: string;
  providerStatus: string | null;
  metadata: Record<string, unknown>;
}

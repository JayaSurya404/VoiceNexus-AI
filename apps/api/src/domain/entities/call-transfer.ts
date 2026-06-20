import type { CallTransferStatus } from "@voicenexus/contracts";

export interface CallTransfer {
  id: string;
  organizationId: string;
  callSessionId: string;
  fromUserId: string;
  toPhoneNumber: string;
  status: CallTransferStatus;
  reason: string;
  createdAt: Date;
}

export interface NewCallTransfer {
  organizationId: string;
  callSessionId: string;
  fromUserId: string;
  toPhoneNumber: string;
  status: CallTransferStatus;
  reason: string;
}

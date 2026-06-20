export const aiConversationStatuses = ["CONNECTING", "ACTIVE", "ENDED", "FAILED"] as const;

export type AiConversationStatus = (typeof aiConversationStatuses)[number];

export interface AiConversationSession {
  id: string;
  organizationId: string;
  callSessionId: string;
  providerCallSid: string | null;
  streamSid: string | null;
  status: AiConversationStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewAiConversationSession {
  organizationId: string;
  callSessionId: string;
  providerCallSid: string | null;
  streamSid: string | null;
  status: AiConversationStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
}

export interface AiConversationSessionUpdate {
  providerCallSid?: string | null;
  streamSid?: string | null;
  status?: AiConversationStatus;
  startedAt?: Date | null;
  endedAt?: Date | null;
  metadata?: Record<string, unknown>;
}

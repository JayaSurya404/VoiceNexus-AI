export type RuntimeProviderName = "openai" | "groq" | "gemini";

export type RuntimeSessionStatus =
  | "INITIALIZING"
  | "ACTIVE"
  | "ESCALATING"
  | "HUMAN_ASSIGNED"
  | "COMPLETED"
  | "FAILED"
  | "RECOVERING";

export type RuntimeCallDirection = "INBOUND" | "OUTBOUND";

export type RuntimeCallStatus =
  | "INCOMING"
  | "OUTGOING"
  | "STARTED"
  | "ACTIVE"
  | "COMPLETED"
  | "FAILED"
  | "RECORDING_AVAILABLE";

export interface OrganizationProviderRuntimeConfig {
  organizationId: string;
  preferredProvider: RuntimeProviderName;
  fallbackProviders: RuntimeProviderName[];
  modelByProvider: Partial<Record<RuntimeProviderName, string>>;
  automaticFallback: boolean;
  active: boolean;
  updatedAt: Date;
}

export interface RuntimeProviderSelection {
  provider: RuntimeProviderName;
  model: string;
  fallbackChain: RuntimeProviderName[];
  reason: string;
  healthAware: boolean;
}

export interface CallRuntimeSession {
  id: string;
  organizationId: string;
  conversationId: string;
  callSid?: string;
  direction: RuntimeCallDirection;
  status: RuntimeSessionStatus;
  provider: RuntimeProviderName;
  model: string;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  activeAgentId?: string;
  activeQueueId?: string;
  escalationId?: string;
  metadata: Record<string, unknown>;
}

export interface RuntimeConversationTurn {
  id: string;
  organizationId: string;
  sessionId: string;
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
  provider: RuntimeProviderName;
  model: string;
  citations: Array<{ documentId: string; chunkId?: string; title?: string; url?: string }>;
  confidence: number;
  fallbackUsed: boolean;
  createdAt: Date;
}

export interface RuntimeFallbackEvent {
  id: string;
  organizationId: string;
  sessionId?: string;
  fromProvider: RuntimeProviderName;
  toProvider: RuntimeProviderName;
  reason: string;
  recovered: boolean;
  createdAt: Date;
}

export interface RuntimeIncident {
  id: string;
  organizationId: string;
  sessionId?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: "PROVIDER" | "TWILIO" | "RAG" | "ROUTING" | "REALTIME" | "UNKNOWN";
  message: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface RuntimeHealthSnapshot {
  organizationId: string;
  activeSessions: number;
  activeProvider?: RuntimeProviderName;
  providerStatuses: Array<{ provider: string; ready: boolean; defaultModel: string; message: string }>;
  fallbackEvents: RuntimeFallbackEvent[];
  incidents: RuntimeIncident[];
  dependencies: {
    providersReady: boolean;
    twilioReady: boolean;
    redisReady: boolean;
    mongoReady: boolean;
  };
  capturedAt: Date;
}

export interface RetryPolicy {
  id: string;
  organizationId: string | null;
  provider: "OPENAI" | "GROQ" | "GEMINI" | "TWILIO" | "REDIS";
  maxAttempts: number;
  backoffMs: number;
  jitter: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CircuitBreaker {
  id: string;
  organizationId: string | null;
  provider: "OPENAI" | "GROQ" | "GEMINI" | "TWILIO" | "REDIS";
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureThreshold: number;
  failureCount: number;
  resetAfterSeconds: number;
  openedAt: Date | null;
  lastFailureAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackStrategy {
  id: string;
  organizationId: string | null;
  provider: "OPENAI" | "GROQ" | "GEMINI" | "TWILIO" | "REDIS";
  strategy: "USE_CACHE" | "USE_BACKUP_PROVIDER" | "DEGRADE_GRACEFULLY" | "QUEUE_FOR_RETRY";
  enabled: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

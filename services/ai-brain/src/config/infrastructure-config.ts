export type RuntimeEnvironment = "development" | "production" | "test";

export interface InfrastructureConfigIssue {
  key: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  message: string;
}

export interface InfrastructureConfig {
  runtimeEnvironment: RuntimeEnvironment;
  openai: {
    apiKey: string | null;
    chatModel: string;
    embeddingModel: string;
  };
  groq: {
    apiKey: string | null;
    chatModel: string;
  };
  gemini: {
    apiKey: string | null;
    chatModel: string;
  };
  twilio: {
    accountSid: string | null;
    authToken: string | null;
    fromNumber: string | null;
    voiceWebhookUrl: string | null;
  };
  redis: {
    url: string | null;
    keyPrefix: string;
  };
  mongo: {
    uri: string | null;
  };
  issues: InfrastructureConfigIssue[];
}

const runtimeEnvironment = (value: string | undefined): RuntimeEnvironment => {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
};

const issue = (
  key: string,
  value: string | undefined,
  required: boolean,
  validator: (value: string) => boolean = (candidate) => candidate.trim().length > 0,
): InfrastructureConfigIssue => {
  const present = Boolean(value);
  const valid = present ? validator(value ?? "") : !required;
  return {
    key,
    required,
    present,
    valid,
    message: valid ? `${key} is ready` : required ? `${key} is required` : `${key} is optional but invalid`,
  };
};

export const loadInfrastructureConfig = (): InfrastructureConfig => {
  const environment = runtimeEnvironment(process.env.NODE_ENV);
  const production = environment === "production";
  const issues = [
    issue("MONGODB_URI", process.env.MONGODB_URI, true, (value) => value.startsWith("mongodb")),
    issue("REDIS_URL", process.env.REDIS_URL, production, (value) => value.startsWith("redis")),
    issue("OPENAI_API_KEY", process.env.OPENAI_API_KEY, true),
    issue("GROQ_API_KEY", process.env.GROQ_API_KEY, false),
    issue("GEMINI_API_KEY", process.env.GEMINI_API_KEY, false),
    issue("TWILIO_ACCOUNT_SID", process.env.TWILIO_ACCOUNT_SID, production),
    issue("TWILIO_AUTH_TOKEN", process.env.TWILIO_AUTH_TOKEN, production),
    issue("TWILIO_FROM_NUMBER", process.env.TWILIO_FROM_NUMBER, production),
    issue("TWILIO_VOICE_WEBHOOK_URL", process.env.TWILIO_VOICE_WEBHOOK_URL ?? process.env.PUBLIC_WEBHOOK_URL, production, (value) =>
      value.startsWith("https://"),
    ),
  ];

  return {
    runtimeEnvironment: environment,
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? null,
      chatModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY ?? null,
      chatModel: process.env.GROQ_MODEL ?? "llama-3.1-70b-versatile",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY ?? null,
      chatModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ?? null,
      authToken: process.env.TWILIO_AUTH_TOKEN ?? null,
      fromNumber: process.env.TWILIO_FROM_NUMBER ?? null,
      voiceWebhookUrl: process.env.TWILIO_VOICE_WEBHOOK_URL ?? process.env.PUBLIC_WEBHOOK_URL ?? null,
    },
    redis: {
      url: process.env.REDIS_URL ?? null,
      keyPrefix: process.env.REDIS_KEY_PREFIX ?? "voicenexus",
    },
    mongo: {
      uri: process.env.MONGODB_URI ?? null,
    },
    issues,
  };
};

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

import { z } from "zod";

const localEnvPath = resolve(process.cwd(), ".env");

if (existsSync(localEnvPath)) {
  loadEnvFile(localEnvPath);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REALTIME_GATEWAY_PORT: z.coerce.number().int().positive().max(65_535).default(4001),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("voicenexus"),
  REDIS_URL: z.string().url(),
  MEDIA_STREAM_SECRET: z.string().min(32),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default("voicenexus-api"),
  JWT_AUDIENCE: z.string().min(1).default("voicenexus-web"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid realtime gateway environment configuration: ${JSON.stringify(fields)}`);
}

export const env = parsed.data;

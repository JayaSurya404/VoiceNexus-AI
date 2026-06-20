import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

import { z } from "zod";

const localEnvPath = resolve(process.cwd(), ".env");

if (existsSync(localEnvPath)) {
  loadEnvFile(localEnvPath);
}

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(4000),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("voicenexus"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default("voicenexus-api"),
  JWT_AUDIENCE: z.string().min(1).default("voicenexus-web"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(86_400).default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(3_600)
    .max(31_536_000)
    .default(604_800),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  COOKIE_SECURE: booleanString,
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(fields)}`);
}

export const env = parsed.data;

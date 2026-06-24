import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  AI_BRAIN_PORT: z.coerce.number().int().positive().default(4002),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(32),
  MONGODB_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
});

export const env = envSchema.parse(process.env);
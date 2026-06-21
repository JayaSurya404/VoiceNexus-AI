import "dotenv/config";
import { randomUUID } from "node:crypto";

import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  WORKER_ID: z.string().min(1).default(`automation-worker-${randomUUID()}`),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  WORKER_BATCH_SIZE: z.coerce.number().int().positive().default(100),
  WORKER_MAX_RETRIES: z.coerce.number().int().nonnegative().default(5),
});

export const env = envSchema.parse(process.env);

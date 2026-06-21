import { env } from "../../config/env.js";

const retryDelays = [30, 60, 120, 300];

export class RetryService {
  nextRetry(input: { attemptCount: number; maxRetries?: number }): { shouldRetry: boolean; delaySeconds: number } {
    const maxRetries = input.maxRetries ?? env.WORKER_MAX_RETRIES;

    if (input.attemptCount >= maxRetries) {
      return { shouldRetry: false, delaySeconds: 0 };
    }

    return {
      shouldRetry: true,
      delaySeconds: retryDelays[Math.min(input.attemptCount, retryDelays.length - 1)] ?? 300,
    };
  }
}

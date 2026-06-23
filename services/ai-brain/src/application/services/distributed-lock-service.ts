import type { DistributedLock } from "../../domain/entities/distributed-lock.js";
import type { DistributedLockRepository } from "../ports.js";

export class DistributedLockService {
  constructor(private readonly locks: DistributedLockRepository) {}

  async acquire(input: {
    organizationId?: string | null;
    lockKey: string;
    ownerId: string;
    purpose: DistributedLock["purpose"];
    ttlSeconds: number;
    metadata?: Record<string, unknown>;
  }): Promise<DistributedLock | null> {
    return this.locks.acquire({
      organizationId: input.organizationId ?? null,
      lockKey: input.lockKey,
      ownerId: input.ownerId,
      purpose: input.purpose,
      expiresAt: new Date(Date.now() + input.ttlSeconds * 1000),
      acquiredAt: new Date(),
      metadata: input.metadata ?? {},
    });
  }

  async release(lockKey: string, ownerId: string): Promise<DistributedLock | null> {
    return this.locks.release(lockKey, ownerId);
  }

  async list(organizationId: string | null = null): Promise<DistributedLock[]> {
    return this.locks.list(organizationId);
  }
}
